# Media Notes

Example Twenty app demonstrating media recording with the **standard web
APIs**: the sandbox polyfills `navigator.mediaDevices.getUserMedia` and
`MediaRecorder`, so the recording code reads like it would in any web page.
The only Twenty-specific call is `uploadFile` from
`twenty-sdk/front-component`, which stores the recorded blob in a FILES
field.

A pinned global command ("Record media note") opens a front component that
records a voice or video note with its own UI, uploads it on stop, attaches
it to a Media note record, then plays the stored file back from its signed
URL.

## Run the e2e regression test

The test drives the full flow against a local Twenty instance with Chromium's
fake media devices (no real microphone or camera needed):

Cookie sessions are credentialed, so the front only authenticates from the
API's own origin — workspace subdomains included, which the login flow lands
on. Serve the front build from the server rather than on its own port:

```sh
# from the repo root
npx nx build twenty-sdk
NODE_ENV=production npx nx build twenty-front
npx nx build twenty-server
cp -r packages/twenty-front/build packages/twenty-server/dist/front

# start:ci, not start: the watch target would rimraf dist and delete the front
npx nx start:ci twenty-server &

node packages/twenty-sdk/dist/cli.cjs app:publish --private && node packages/twenty-sdk/dist/cli.cjs app:install

# then, from this directory
FRONT_BASE_URL=http://localhost:3000 npx playwright test --project=setup --project=chromium
```

It asserts the app-owned recording timer, the playback preview, the uploaded
file reference received by the component, and the cancel path — screenshots
of each step land in `e2e/.results/screenshots/`.
