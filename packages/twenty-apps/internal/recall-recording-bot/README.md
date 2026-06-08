# Recall Recording Bot

This is a [Twenty](https://twenty.com) application bootstrapped with
[`create-twenty-app`](https://www.npmjs.com/package/create-twenty-app).

It owns Recall-specific recording bot policy. Core `CallRecording` remains the
shared recording artifact; this app decides whether a Recall bot should attend a
calendar event.

## What this app adds

- `CalendarEvent.recallRecordingBotPreference`, an app-owned select field with
  `AUTO`, `ON`, and `OFF`.
- Focused role permissions for reading calendar events, participants, calendar
  associations, and reconciling `CallRecording` records.
- Pure policy utilities for resolving per-event bot intent and deduping duplicate
  synced calendar rows by real meeting key.
- Database-event logic functions that reconcile scheduled `CallRecording`
  requests when calendar events or participants change.
- A configurable cron backstop that scans upcoming calendar events every minute
  and only runs reconciliation on the configured interval.

## Getting Started

This app was scaffolded with a local Twenty server running at [http://localhost:2020](http://localhost:2020).

Login with the default development credentials: `tim@apple.dev` / `tim@apple.dev`.

Run `yarn twenty help` to list all available commands.

## Useful Commands

- `yarn twenty dev` - Start the development server and sync your app
- `yarn twenty docker:status` - Check the local Twenty server status
- `yarn twenty docker:start` - Start the local Twenty server
- `yarn test` - Run integration tests

## Scope

This PR scaffolds the app, moves the preference/policy boundary into it, and
reconciles app-managed scheduled `CallRecording` rows. The Recall provider job
and request/cancel API calls are intentionally left for the provider integration
layer.

## Learn More

- [Twenty Apps documentation](https://docs.twenty.com/developers/extend/apps/getting-started/quick-start)
- [twenty-sdk CLI reference](https://www.npmjs.com/package/twenty-sdk)
- [Discord](https://discord.gg/cx5n4Jzs57)
