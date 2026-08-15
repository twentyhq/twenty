# Call Recorder — Privacy & data

This document explains what Call Recorder captures, who processes it, how long
it is kept, and the controls you have. It describes how the app works; it is
not legal advice. The recordings, transcripts, and summaries the app produces
belong to your workspace, and your organization is responsible for using them
lawfully.

## Recording defaults and controls

The workspace-level `CALL_RECORDER_RECORD_BY_DEFAULT` app setting is the
default for all meetings. It ships **on**, so after installing the app the
bot records every eligible meeting (upcoming, synced from a connected
calendar, with a supported video-conference link). A workspace admin can turn
it **off** to make recording opt-in per meeting.

Each calendar event carries a **Recording Bot** field that overrides the
workspace default for that meeting:

| Recording Bot field | Behavior |
|---|---|
| *(empty, the default)* | Follows the workspace `CALL_RECORDER_RECORD_BY_DEFAULT` app setting. |
| **On** | The bot records this meeting, regardless of the workspace setting. |
| **Off** | The bot never records this meeting, regardless of the workspace setting. |

Setting a meeting to **Off** — or turning the workspace setting off — cancels
any bot already scheduled for it.

## The bot is visible on the call

The bot joins as a regular, named participant — there is no hidden capture.
Its display name defaults to `Twenty.com` and is configurable via the
`CALL_RECORDER_NAME` app setting; its camera tile can show your workspace
logo. Participants can see it in the participant list for the whole call.

## What is captured

For each recorded meeting the app produces:

- A **video recording** (MP4) and an **audio recording** (MP3) of the call.
- A **transcript** with speaker names and timestamps.
- An optional **AI summary** generated from the transcript.
- Meeting metadata already in your CRM: title, start and end time, the
  conference link, and calendar participants (used to match transcript
  speakers to CRM contacts for display).

The bot does not capture screen-share files, chat messages, or anything after
it leaves the call.

## Who processes the data

- **[Recall.ai](https://recall.ai)** operates the meeting bot and processes
  the media, in the region configured by your server admin (`RECALL_REGION`,
  Frankfurt `eu-central-1` by default on self-hosted setups).
- **Transcription** runs on Recall.ai's transcription provider by default, or
  on **Gladia** if the workspace selects it via
  `CALL_RECORDER_TRANSCRIPT_PROVIDER`.
- **AI summaries** send the transcript to the AI model configured for your
  workspace. Set `CALL_RECORDER_SUMMARY_ENABLED` to `false` to disable
  summaries entirely.

## How long data is kept

- **Recall.ai keeps a temporary copy** of the media while processing it,
  deleted after `CALL_RECORDER_RECORDING_RETENTION_HOURS` (default 166 hours,
  just under 7 days).
- **Your workspace keeps the durable copy**: the video, audio, transcript,
  and summary are imported into a CallRecording record stored in your
  Twenty workspace's own storage, alongside the rest of your CRM data and
  subject to the same roles and permissions. It stays until someone in your
  workspace deletes it — the app never deletes your copy on its own.

## Consent and notice

Call-recording and wiretapping laws differ by country and by US state; many
require that some or all participants consent to being recorded. You are
responsible for giving participants whatever notice applies to your calls.
Practical steps:

- Turn `CALL_RECORDER_RECORD_BY_DEFAULT` **off** and set individual meetings
  to **On**, so a person decides per meeting.
- Announce the recording at the start of the call, or mention it in the
  calendar invite.
- Give the bot an unmistakable display name (for example
  `Acme Notetaker — this call is recorded`) via `CALL_RECORDER_NAME`.
- Ask the bot's owner to set the meeting to **Off** if a participant objects
  — the recording request is canceled, and no charge applies.

## Controls at a glance

| Control | Where | Default |
|---|---|---|
| Record this meeting | **Recording Bot** field on the calendar event | Empty (follows the workspace default) |
| Record all eligible meetings | `CALL_RECORDER_RECORD_BY_DEFAULT` app setting | On |
| AI summaries | `CALL_RECORDER_SUMMARY_ENABLED` app setting | On |
| Bot display name | `CALL_RECORDER_NAME` app setting | `Twenty.com` |
| Processing region | `RECALL_REGION` server variable | `eu-central-1` |
| Recall.ai media retention | `CALL_RECORDER_RECORDING_RETENTION_HOURS` server variable | 166 hours |
| Delete a recording | Delete the CallRecording record in your workspace | Kept until deleted |
