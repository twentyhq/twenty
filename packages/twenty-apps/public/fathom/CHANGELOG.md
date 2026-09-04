# Changelog

All notable changes to this application are documented in this file.

## 0.1.1

- State who may read each synced Call Recording at creation: the connecting
  workspace member for a personal Fathom connection, everyone otherwise.
  Requires Twenty 2.39.0 or later.

## 0.1.0

- Add per-user Fathom OAuth and signed webhook registration.
- Sync new Fathom recordings into idempotent Twenty Call Recordings.
- Delete registered Fathom webhooks when the app is uninstalled.
- Import the last 31 days of recordings when a Fathom account is connected
  and accept manual history imports, paced per connected account.
- Add the Sync Fathom Call and List Fathom Calls By Participant workflow and AI
  actions.
