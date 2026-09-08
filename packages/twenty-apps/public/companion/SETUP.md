# Workspace setup

1. Install dependencies with Node 24 and Yarn 4: `yarn install`.
2. Publish the official `@twentyhq/companion-app` package, let the server sync its catalog, and install Desktop Recorder from Settings → Applications. The reserved OAuth identity cannot be created through workspace registrations or tarball uploads.
3. As a server administrator, configure this application's registration variables: `RECALL_API_KEY`, `RECALL_WEBHOOK_SECRET`, and `RECALL_REGION` (default `eu-central-1`). The registration must belong to the workspace hosting its server webhook resolver.
4. Create a separate Recall webhook endpoint pointing to `<public-server-url>/webhooks/server/2f955a7f-9d03-44c6-bb12-fbc8f6e33b07`. Subscribe to `sdk_upload.recording_started`, `sdk_upload.recording_ended`, `sdk_upload.complete`, `sdk_upload.failed`, `recording.done`, `recording.failed`, `transcript.done`, and `transcript.failed`. Use its applicable Recall signing secret. Keep existing Call Recorder webhook endpoints separate.
5. Open the installed app's Settings tab. Configure its published macOS download URL, AI summaries, transcript provider, and optional additional summary instructions. AI must be configured in Twenty for summaries; Gladia requires its provider key in Recall.
6. Download Twenty from that Settings tab and sign in to the same workspace. It discovers the function domain and calls authenticated `POST /companion/desktop`. Sign-in requires user permissions for calendars and recordings; an application-only API key cannot use that endpoint.

Application universal identifier: `8bdaaa9f-dc53-4247-a89b-aa386c9b3244`.

## Local verification

Use a local Twenty instance with the OAuth and atomic app-state prerequisites installed. Verify installation, per-user sign-in, settings, and recording recovery before publishing a release.

A temporary public tunnel is required for Recall callbacks to localhost. When its URL changes, update the dedicated Companion Recall endpoint. Keep the tunnel and Docker running while processing recordings, and retire the local endpoint when testing ends.
