# Teams Transcripts

**Bring Microsoft Teams meeting transcripts into Twenty as Call Recordings.**

## What you get

- Teams meeting transcripts saved as Call Recordings, one per Graph transcript,
  idempotent across re-imports
- Speaker-attributed transcript entries in the same shape the Call Recorder app
  uses, so they render in the existing Call Recording UI
- A link to the matching Calendar Event when the join URL and start time
  identify one clear match, which brings in attendees and people
- An AI summary generated on the Call Recording as soon as a transcript lands
- Workflow and AI actions to list an organizer's transcripts and import one

## Requirements

Transcripts are read through Microsoft Graph with application permissions, so
a Microsoft Entra administrator has to register an app, grant it access, and
turn on transcript API access in the Teams admin center. The exact steps live
in [SETUP.md](SETUP.md).

## Heads up

- Graph only returns transcripts for meetings that have not expired and that
  fall inside the tenant's transcript expiration policy. Older calls are not
  reachable through the API; run the probe in `scripts/` to see how far back
  your tenant goes before planning a large import.
- Transcripts exist only for meetings where transcription was turned on.
- Only meetings organized by users of the tenant are visible. Ad hoc, 1:1 and
  PSTN call transcripts are not imported yet.
- When the tenant disables speaker attribution, entries are imported without
  speaker names.

Development setup lives in [SETUP.md](SETUP.md).
