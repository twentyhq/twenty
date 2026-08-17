# Call Recorder — Privacy & data

Call Recorder is an application published by Twenty. The recordings,
transcripts, and summaries it produces are stored in your workspace as
**Customer Data**: your organization controls them, and they are handled
under the same terms as the rest of your CRM data —
[Twenty's Privacy Policy](https://twenty.com/privacy-policy) and, on Twenty
Cloud, the Data Processing Agreement your workspace can review and sign under
**Settings → Legal → DPA**. Security practices and the list of subprocessors
are published in [Twenty's Trust Center](https://trust.twenty.com/).

Those documents govern; this page explains what the app itself does — what it
records, where the data flows, how long it is kept, and the controls you
have.

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
  the media, in Frankfurt, Germany by default.
  - On **Twenty Cloud**, Recall.ai processes it on Twenty's behalf, like the
    other subprocessors listed in the
    [Trust Center](https://trust.twenty.com/).
  - On a **self-hosted** deployment, the media flows between your server and
    the Recall.ai account your own admin connected (see
    [SETUP.md](./SETUP.md)); Twenty has no access to it, consistent with how
    Twenty's Privacy Policy treats self-hosted instances.
- **Transcription** runs on Recall.ai's transcription provider by default, or
  on **Gladia** if the workspace selects it via
  `CALL_RECORDER_TRANSCRIPT_PROVIDER`.
- **AI summaries** send the transcript to the AI model provider configured
  for your workspace, solely to generate the summary, as described in the
  AI-features section of [Twenty's Terms](https://twenty.com/terms). Twenty
  does not train AI models on your data. Set `CALL_RECORDER_SUMMARY_ENABLED`
  to `false` to disable summaries entirely.

## How long data is kept

- **Recall.ai keeps a temporary copy** of the media while processing it,
  deleted automatically after a deployment-configured window (just under
  7 days by default).
- **Your workspace keeps the durable copy**: the video, audio, transcript,
  and summary are imported into a CallRecording record stored in your
  Twenty workspace's own storage, alongside the rest of your CRM data and
  subject to the same roles and permissions. It stays until someone in your
  workspace deletes it — the app never deletes your copy on its own, and
  deletion then follows the retention terms of
  [Twenty's Privacy Policy](https://twenty.com/privacy-policy), like any
  other Customer Data.

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
| Delete a recording | Delete the CallRecording record in your workspace | Kept until deleted |

The Recall.ai processing region and its temporary retention window are
deployment-level configuration, managed by whoever operates the Twenty server
(Twenty on Twenty Cloud, your server admin if self-hosted, see
[SETUP.md](./SETUP.md)). Workspace users don't see or change those.
