# Fathom

**Bring Fathom meeting recordings, transcripts, and insights into Twenty.**

## What you get

- Fathom recordings saved as Call Recordings
- Transcripts, summaries, and action items
- Recording video, or audio for audio-only calls
- Links to matching calendar events when the match is unambiguous
- Automatic sync for new recordings
- A 31-day import when a Fathom account is connected, and manual imports of
  older history
- Workflow and AI actions to sync one recording or list recordings by
  participant

## Requirements

Each person connects their Fathom account to Twenty. The connected Fathom
account decides which recordings Twenty can import; the Fathom and Twenty login
emails do not need to match.

## Heads up

- Twenty only links a recording to a calendar event when its meeting URL and
  scheduled time identify one clear match.
- Fathom generates the downloadable video in the background, so a recording
  stays in Processing for a few minutes after its transcript arrives, until its
  media lands or is settled as unavailable.
- Media is skipped for recordings above 500 MB, for recordings Fathom has no
  downloadable media for, and for limited-access shares that the connected
  account may view but not download. The Fathom Media Failure Reason field on
  the Call Recording says which of these applied.
- Once a reason is recorded, automatic syncs stop asking Fathom to generate the
  same file again. Running Sync Fathom Call on that recording clears the reason
  and tries once more, which is how a re-shared recording gets its media.
- Disconnect and reconnect Fathom after changing the webhook URL or webhook
  scopes so Fathom receives the new registration.

Development setup lives in [SETUP.md](SETUP.md).
