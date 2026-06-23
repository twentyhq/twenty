# Call recording

Record, view, and summarize calls directly inside your Twenty workspace. The app stores call media and transcripts as records, plays them back with a synced transcript, and generates AI summaries you can read on each call or roll up across a person's history.

## What the app does

The app adds a **Call recording** object to your workspace and provides the screens and automation to turn a finished call into a searchable, summarized record. Recordings themselves are captured by an external recorder; this app receives the finished audio or video and transcript, finalizes the record, links it to the right people, and renders everything for review.

## What it adds to your workspace

### Call recording object

A new **Call recording** object (menu item **Call recordings**, phone icon) with the following fields:

- **Name** — the record label, typically set to the call's participants.
- **Status** — `Ongoing` (default) or `Ended`.
- **Created at** / **Ended at** — when the recording started and finished.
- **Recording file** — the audio or video media file (single file).
- **Transcript file** — the raw transcript as a JSON attachment (single file).
- **Transcript** — a human-readable, speaker-labeled transcript.
- **Summary** — the AI-generated summary of the call.
- **Person** — the contact the call is linked to.
- **Workspace Member** — the team member the call is linked to.

Each **Person** and **Workspace Member** record gains a **Call Recordings** section listing their linked calls.

### Call recordings view

A default **Call recordings** list view shows name, created/ended dates, status, recording and transcript files, transcript, and the linked **Workspace Member** and person, with summary as the last column.

### Record page

Opening a call recording shows tabs for:

- **Summary** — the AI-generated summary, rendered as formatted text.
- **Transcript** — a media player for the recording with a synchronized transcript below it (stacked vertically). Playback position highlights the active speaker block and tracks word-by-word, so you can follow along or jump through the call.
- **Timeline**, **Tasks**, **Notes**, and **Files** — standard activity tabs for the record.

### Dashboard

A **Call Recording Insights** dashboard with four charts: total calls, calls per person, calls per workspace member, and calls over time (by month).

## How calls are finalized and summarized

When an external recorder finishes a call, it sends the recording to the app. The app then:

1. Downloads and stores the audio or video on the **Recording file** field.
2. Processes the transcript, stores it as the **Transcript file**, and renders a readable speaker-labeled version into the **Transcript** field.
3. Marks the call **Ended**, stamps **Ended at**, and names the record after its participants.
4. Generates an AI summary (overview, key discussion points, action items) into the **Summary** field.
5. Matches participants by name to a workspace member or person and links the record accordingly. Workspace members take priority; the first fuzzy name match wins.

### Summarizing on demand

Summaries are also reachable through the Twenty AI agent: a **Call Transcript Summarization** skill instructs the agent to read a call's transcript and write a structured summary (overview, key discussion points, decisions, action items, sentiment) back to the record.

### Summarizing a person's calls

From any **Person** record, the **Summarize call recordings** action produces a single cross-call summary of all calls linked to that contact, highlighting themes, action items, and risks or opportunities across the history.

## Media support

The transcript view plays audio and video recordings using the file's extension. Common audio and video formats are supported; unrecognized file types cannot be played back.

## Setup

For the app to generate AI summaries, the workspace's AI features must be available, as summaries are produced through Twenty's built-in AI. No third-party API keys are configured in the app.

Recordings are produced by an external recorder that delivers finished calls to the app, so call capture and transcription must be set up on that side.

## Limitations

- The app does not capture calls itself; it finalizes, stores, and summarizes recordings delivered by an external recorder.
- Recording and transcript fields hold a single file each.
- Participant matching relies on fuzzy name matching and links to the first match found, so calls with ambiguous or unrecognized participant names may be left unlinked or linked imperfectly.
