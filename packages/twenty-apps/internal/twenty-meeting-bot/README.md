# Twenty Meeting Bot

This is a [Twenty](https://twenty.com) application bootstrapped with
[`create-twenty-app`](https://www.npmjs.com/package/create-twenty-app).

It owns meeting bot policy and the Recall.ai integration behind it. Core
`CallRecording` remains the shared recording artifact; this app decides whether
the meeting bot should attend a calendar event.

## What this app adds

- `WorkspaceMember.meetingBotAutoRecordEnabled`, an app-owned per-user boolean that
  auto-records the member's upcoming meetings with a conference link, plus a
  settings front component exposing the toggle in the app settings page.
- `CalendarEvent.meetingBotPreference`, an app-owned nullable select
  override with `ON` and `OFF`; when empty, participating members'
  auto-record settings decide.
- Focused role permissions for reading calendar events, participants, calendar
  associations, workspace members, and reconciling `CallRecording` records.
- Pure policy utilities for resolving per-event bot intent and deduping duplicate
  synced calendar rows by real meeting key.
- Database-event logic functions that reconcile scheduled `CallRecording`
  requests when calendar events, participants, or workspace member auto-record
  settings change.
- Recall API calls to create, reschedule, and cancel scheduled meeting bots.
- A `/s/webhook/recall` route that verifies Recall webhook signatures and updates
  matching `CallRecording` records.
- A configurable cron backstop that wakes every minute and, on the configured
  interval, reconciles calendar events in a recent-and-upcoming window.

## Recall Prerequisites

Server variables, set by the server admin on the application registration
(admin panel) and hidden from workspaces:

- `RECALL_API_KEY` - API key for the selected Recall region.
- `RECALL_WEBHOOK_SECRET` - signing secret from the Recall webhook endpoint.
- `RECALL_REGION` - Recall region for API calls. Asia Pacific Tokyo is
  `ap-northeast-1`.
- `RECALL_RECORDING_BOT_CRON_INTERVAL_MINUTES` - backstop reconciliation
  interval.

Application variables, set per workspace in the app settings:

- `RECALL_RECORDING_BOT_ENABLED` - workspace opt-in toggle, `false` by default.
- `RECALL_BOT_NAME` - optional display name for scheduled bots.

Configure the Recall webhook URL as
`https://<public-twenty-backend>/s/webhook/recall`. For local QA, expose the
backend on port 3000 with a tunnel such as ngrok and use the tunnel URL plus
`/s/webhook/recall`.

## Getting Started

For local QA in this repo, keep the Twenty backend running on
[http://localhost:3000](http://localhost:3000) and the frontend running on
[http://localhost:3001](http://localhost:3001).

Login with the default development credentials: `tim@apple.dev` / `tim@apple.dev`.

Run `yarn twenty help` to list all available commands.

## Useful Commands

- `yarn twenty dev` - Start the development server and sync your app
- `TWENTY_API_URL=http://localhost:3000 yarn test` - Run integration tests
  against the local backend (defaults to `http://localhost:2020` otherwise)
- `yarn test:unit` - Run focused app-side unit tests

## Scope

This app owns meeting bot policy, Recall bot scheduling calls, and Recall
webhook status updates. Core `CallRecording` remains the shared recording artifact.

## Learn More

- [Twenty Apps documentation](https://docs.twenty.com/developers/extend/apps/getting-started/quick-start)
- [twenty-sdk CLI reference](https://www.npmjs.com/package/twenty-sdk)
- [Discord](https://discord.gg/cx5n4Jzs57)
