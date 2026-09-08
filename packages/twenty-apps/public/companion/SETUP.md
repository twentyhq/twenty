# Workspace setup

1. Install dependencies with Node 24 and Yarn 4: `yarn install`.
2. Select the intended Twenty remote and install with `yarn twenty -r <remote> apply`. For the existing local Apple test workspace at `http://localhost:2021`, use `companion-local`. Do not reset its database.
3. As a server administrator, configure this application's registration variables: `RECALL_API_KEY`, `RECALL_WEBHOOK_SECRET`, and `RECALL_REGION` (default `eu-central-1`). The registration must belong to the workspace hosting its server webhook resolver.
4. Create a separate Recall webhook endpoint pointing to `<public-server-url>/webhooks/server/2f955a7f-9d03-44c6-bb12-fbc8f6e33b07`. Subscribe to `sdk_upload.recording_started`, `sdk_upload.recording_ended`, `sdk_upload.complete`, `sdk_upload.failed`, `recording.done`, `recording.failed`, `transcript.done`, and `transcript.failed`. Use its applicable Recall signing secret. Keep existing Call Recorder webhook endpoints separate.
5. Configure the installed app's AI summaries, transcript provider, and optional additional summary instructions. AI must be configured in Twenty for summaries; Gladia requires its provider key in Recall.
6. Launch the rebuilt desktop app and sign in to the same workspace. It discovers the function domain and calls authenticated `POST /companion/desktop`. Sign-in requires user permissions for calendars and recordings; an application-only API key cannot use that endpoint.

Application universal identifier: `8bdaaa9f-dc53-4247-a89b-aa386c9b3244`.

## Migrating existing desktop history

For a workspace that used the old Call Recorder desktop extension, install Companion before migrating. Wait for in-progress legacy recordings to finish. Run the script with an administrator API key supplied in a private file:

```sh
TWENTY_API_URL=http://localhost:2021 \
TWENTY_API_KEY_FILE=/path/to/private-key-file \
node scripts/migrate-desktop-recordings.mjs
```

Review the dry-run record IDs, then repeat with `--apply`. The script copies only completed/failed desktop audio sessions lacking Companion ownership. It preserves record IDs, media, transcripts, summaries, and legacy metadata, and skips active recordings. Rerunning it leaves migrated records alone. This is a one-time migration; Companion's runtime never reads legacy Call Recorder fields.

Retain the legacy backend while any older desktop sessions finish. The updated Call Recorder webhook handler ignores Companion events so the apps can coexist. No Call Recorder uninstall or data deletion is needed.

## Local verification

The existing Docker server is `twenty-app-dev-test`, port 2021. Its seeded Apple user is `tim@apple.dev` (email and password). Sample calendar events are not a connected external calendar. The native app and integration can be verified with this workspace without recording audio.

A temporary public tunnel is required for Recall callbacks to localhost. When its URL changes, update the dedicated Companion Recall endpoint. Keep the tunnel and Docker running while processing recordings, and retire the local endpoint when testing ends. Billing is disabled in this local workspace.
