# Changelog

All notable changes to this application are documented in this file.

## Unreleased

- Import the video of each synced Fathom recording, or its audio when the
  recording is audio-only, into the Call Recording's media fields.

## 0.1.0

- Add per-user Fathom OAuth and signed webhook registration.
- Sync new Fathom recordings into idempotent Twenty Call Recordings.
- Delete registered Fathom webhooks when the app is uninstalled.
- Import the last 31 days of recordings when a Fathom account is connected
  and accept manual history imports, paced per connected account.
- Add the Sync Fathom Call and List Fathom Calls By Participant workflow and AI
  actions.
