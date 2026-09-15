# Setup

Follow these steps to get your app running locally.

## Prerequisites

- Node.js (version specified in `.nvmrc`)
- Yarn 4
- Docker (to run the local Twenty server)
- A Fathom OAuth client
- A public HTTPS URL forwarding to the local Twenty server

Register this OAuth callback in Fathom:

```text
https://<development-host>/auth/apps/callback
```

Set Twenty's `SERVER_URL` to that same public host. The connection hook registers
this destination with Fathom automatically:

```text
https://<development-host>/webhooks/server/72b52885-e1ba-419f-8e2e-052700f2c9f2?connectionId=<connected-account-id>
```

The ID is the **Fathom webhook resolver** logic function. Deliveries are routed
to the workspace that made the connection, so no per-workspace domain is needed.

## Steps

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Start the local Twenty server:

   ```bash
   yarn twenty docker:start
   ```

   Check the server status at any time with `yarn twenty docker:status`.

3. Set `FATHOM_CLIENT_ID` and `FATHOM_CLIENT_SECRET` as server variables in
   Twenty.

4. Start the development server and sync your app:

   ```bash
   yarn twenty dev
   ```

5. Open [http://localhost:2020](http://localhost:2020), log in with the default development credentials: `tim@apple.dev` / `tim@apple.dev`, and connect Fathom from Settings. The connection hook registers the signed webhook and starts a 31-day import.

6. Import older history when needed with an authenticated request:

   ```bash
   curl -X POST https://<development-host>/s/fathom/backfill \
     -H "Authorization: Bearer <api-key-or-access-token>" \
     -H "Content-Type: application/json" \
     -d '{"days": 30}'
   ```

   The import runs through the requesting user's Fathom connection.

## Media import behaviour

Fathom prepares the downloadable file after the transcript is ready, so a Call
Recording stays in Processing until its media lands or is settled as
unavailable.

- A daily reconciliation pass scans local Call Recordings started in the last
  seven days and resumes media imports inactive for at least 30 minutes.
- Media imports respect Fathom's `Retry-After` delay for up to three retries.
  Continued throttling leaves the import unfinished for the daily recovery
  pass; recordings outside its seven-day window need Sync Fathom Call.
- Media is skipped for recordings above 500 MB, for recordings Fathom has no
  downloadable media for, and for limited-access shares the connected account
  may view but not download. The reason is recorded on the Fathom recording
  import so automatic syncs do not retry a settled failure.
- Running Sync Fathom Call clears a recorded reason and tries once more, which
  is how a re-shared recording gets its media.

Import pacing is best-effort: concurrent jobs can reserve overlapping slots.
After Fathom creates a download, Twenty retries saving its ID up to three total
attempts. A crash or failed save can still cause a later retry to request
another download generation; provider creation and local persistence are not
atomic.

## Verifying your setup

- `yarn lint` - Lint the project with oxlint
- `yarn typecheck` - Type-check the project
- `yarn test:unit` - Run unit tests
- `yarn test` - Run integration tests

## Troubleshooting

Disconnect and reconnect Fathom after changing the webhook URL or the webhook
scopes, so Fathom receives the new registration.

See the [troubleshooting guide](https://docs.twenty.com/developers/extend/apps/getting-started/troubleshooting) or ask on [Discord](https://discord.gg/cx5n4Jzs57).
