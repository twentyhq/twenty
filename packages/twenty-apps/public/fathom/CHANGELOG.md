# Changelog

All notable changes to this application are documented in this file.

## 1.0.1

- No change, fix npm deployment


## 1.0.0

- State who may read each synced Call Recording at creation: the connecting
  workspace member for a personal Fathom connection, everyone otherwise.
  Requires Twenty 2.40.0 or later.
- Import available Fathom video, or audio for audio-only recordings, into the
  Call Recording's media fields when it is within the 500 MB limit.
- Record why media could not be imported in Fathom's internal import state,
  skip automatic retries of a settled failure, and let Sync Fathom Call clear
  it to try again.
- Hold a recording in Processing until its media lands or is settled as
  unavailable, rather than completing it as soon as the transcript arrives.
- Reconcile unfinished local media imports from the latest seven days daily,
  without scanning Fathom history, and finish cleanup after disconnection.
- Leave rate-limited media imports recoverable after their bounded retries,
  and retry saving a generated download ID before failing the job.

## 0.1.0

- Add per-user Fathom OAuth and signed webhook registration.
- Sync new Fathom recordings into idempotent Twenty Call Recordings.
- Delete registered Fathom webhooks when the app is uninstalled.
- Import the last 31 days of recordings when a Fathom account is connected
  and accept manual history imports, paced per connected account.
- Add the Sync Fathom Call and List Fathom Calls By Participant workflow and AI
  actions.
