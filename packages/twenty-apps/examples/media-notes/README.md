# Media Notes

Example Twenty app demonstrating the **media capture** front component
capability: `recordAudio` / `recordVideo` from `twenty-sdk/front-component`.

A pinned global command ("Record media note") opens a front component that
records a voice or video note through the host-owned consent → record →
preview → upload flow, then plays the stored file back from its signed URL.

## Run the e2e regression test

The test drives the full flow against a local Twenty instance with Chromium's
fake media devices (no real microphone or camera needed):

```sh
# from the repo root: server on :3000, front on :3001, app published + installed
npx nx start:ci twenty-server &
npx nx start twenty-front &
npx nx build twenty-sdk
node packages/twenty-sdk/dist/cli.cjs app:publish --private && node packages/twenty-sdk/dist/cli.cjs app:install

# then, from this directory
npx playwright test --project=chromium
```

It asserts the consent gate, the recording timer, the playback preview, the
uploaded file reference received by the component, and the cancel path —
screenshots of each step land in `e2e/.results/screenshots/`.
