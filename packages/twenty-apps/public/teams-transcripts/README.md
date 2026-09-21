# Teams Transcripts

**Bring Microsoft Teams meeting transcripts into Twenty.**

## What you get

- A Microsoft work account connection, with automatic token refresh
- **List My Teams Transcripts**, an AI and workflow action that lists the
  transcripts of scheduled Teams meetings you organized, one calendar page at
  a time

Importing transcripts into Call Recordings is added in follow-up changes.

## Requirements

Transcripts are read through Microsoft Graph with delegated permissions from
the connected Microsoft work account. An administrator configures the OAuth
app and enables transcript API access; users then click Add connection in
Twenty. The exact steps live in [SETUP.md](SETUP.md).

## Heads up

- Graph only returns transcripts for meetings that have not expired and that
  fall inside the tenant's transcript expiration policy.
- Transcripts exist only for meetings where transcription was turned on.
- Only scheduled meetings organized by the connected account are listed. Ad
  hoc, channel, 1:1 and PSTN calls are not covered.
