import { Hono } from 'hono'
import {jsxRenderer} from "hono/jsx-renderer"

const app = new Hono()

app.get(
  "*",
  jsxRenderer(({ children }) => {
    return (
      <html lang="ja">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport"content="width=device-width, initial-scale=1.0"/>
          <link rel="stylesheet" href="https://cdn.ame-x.net/site-auto.css" />
          <style>{`      body {
        display: flex;
        justify-content: center;
        align-items: center;
      }`}</style>
          <title>あああ</title>
        </head>
        <body>{children}</body>
      </html>
    );
  }),
);

app.get('/', (c) => {
  return c.render(<div>
    <h1>Hello</h1><br />
    <form action="/IconGen.mobileconfig" method="post" enctype="multipart/form-data">
      <label htmlFor="URL">URL</label>
      <input type="text" name="URL" id="URL" /><br />
      <label htmlFor="label">Label</label>
      <input type="text" name="Label" id="Label" /><br />
      <label htmlFor="Icon">Icon</label>
      <input type="file" name="Icon" id="Icon" accept="image/png, image/jpeg, image/gif" />
      <input type="submit" value="Submit" />
    </form>
  </div>)
})

app.post('/IconGen.mobileconfig', async (c) => {
  const body = await c.req.parseBody()
  const URL = String(body.URL)
  const Label = String(body.Label)
  const Icon = body.Icon as File
  const icon = await Icon.bytes()
  const IconBase64 = btoa(String.fromCharCode(...new Uint8Array(icon)))
  c.header("Content-Type", "text/xml")
  return c.body(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>${IconBase64}</data>
            <key>IgnoreManifestScope</key>
            <false/>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>${Label}</string>
            <key>Precomposed</key>
            <false/>
            <key>URL</key>
            <string>${URL}</string>
            <key>PayloadIdentifier</key>
            <string>dev.deno.iOS-custom-icon-gen.${Label}.${Math.floor(Math.random()*1000)}</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>${crypto.randomUUID()}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>Web Clip</string>
    <key>PayloadIdentifier</key>
    <string>dev.deno.iOS-custom-icon-gen.${Label}.${Math.floor(Math.random()*1000)}</string>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>${crypto.randomUUID()}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`)})

Deno.serve(app.fetch)
