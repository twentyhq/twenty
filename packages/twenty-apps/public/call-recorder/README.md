# Call Recorder

Automatically record, transcribe, and save every meeting — right inside your CRM.

Call Recorder sends a recording bot to your team's calendar meetings and saves
the video, audio, and a speaker-by-speaker transcript onto the meeting in
Twenty. No more scrambling for notes: every call is captured, searchable, and in
context — ready for your team, your AI agents, and your workflows to act on.

## How it works

1. You have a meeting on your connected calendar with a video link (Zoom, Google
   Meet, Microsoft Teams).
2. Call Recorder sends a bot to join it automatically, just before it starts.
3. The bot records the meeting while it's happening.
4. When the call ends, the recording, audio, and a transcript that labels who
   said what are saved to the meeting.
5. Open the meeting in Twenty to watch it back and read the transcript — which
   follows along as the video plays.

## What you get

- **Recordings on every meeting.** Video, audio, and a speaker-attributed
  transcript, attached to the calendar event they came from.
- **A Call Recording tab.** Watch the recording and read a timestamped
  transcript that scrolls in sync with the video.
- **An on/off switch per meeting.** Every event has a Recording toggle — on by
  default. Flip it off for the meetings you'd rather keep private.
- **Built for AI and automation.** Because transcripts live in your CRM, your
  agents and workflows can summarize calls, pull out action items, and update
  records — whatever you build.

## Recording is automatic

Once your admin installs Call Recorder, recording is on by default — nobody has
to remember to hit record.

A meeting gets recorded when it's on your connected calendar, has a video link,
hasn't happened yet, and its Recording switch is on.

**Don't want a meeting recorded?** Open the event (or your calendar list view)
and switch Recording off — any bot scheduled for it is canceled. And if plans
change (the time moves, the link changes, you turn it back on), Call Recorder
keeps up automatically.

## Billing

Recording is metered. You're charged only for meetings that are actually
recorded, based on real call length, at **1 credit per hour of recording**.
Meetings that were opted out, canceled, or that nobody joined cost nothing.

## Installing

1. Open **Settings → Applications** in Twenty.
2. Find **Call Recorder** and click **Install**.
3. A server admin completes a one-time setup to connect the recording service.
   On Twenty Cloud this may already be done.

## Customize the bot

A workspace admin can tune how the recorder behaves in **Settings →
Applications → Call Recorder**. Everything has a sensible default — change only
what you need:

- **Bot display name** — the name the recorder shows when it joins a call.

  `CALL_RECORDER_NAME` · default `Twenty.com`

- **Join early** — minutes before the start time the bot joins (`0` joins at the
  scheduled start).

  `CALL_RECORDER_JOIN_EARLY_MINUTES` · default `1`

- **Lobby wait** — how long the bot waits to be let in from the lobby before
  giving up.

  `CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS` · default `1200` (20 min)

- **Empty-meeting wait** — how long the bot stays when no one else ever joins.

  `CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS` · default `1200` (20 min)

- **Leave after everyone's gone** — how long the bot keeps recording after
  everyone else leaves.

  `CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS` · default `2`

## Good to know

- **Recording is workspace-wide for now.** When the app is installed, every
  eligible meeting is recorded by default. You control it per meeting with the
  Recording switch; a per-person "dont record my meetings" option is planned for
  later.
- **Meetings need to be on a connected calendar with a video link.** Ad-hoc
  calls that were never on your Google, Outlook, or CalDAV calendar aren't
  recorded.
- **Your recordings stay with you.** Twenty keeps its own copy of the video,
  audio, and transcript, so they remain available in your CRM.

---

**Server admins:** see [SETUP.md](https://github.com/twentyhq/twenty/blob/main/packages/twenty-apps/public/call-recorder/SETUP.md)
to connect the recording service, set the server credentials, and wire up
webhooks.
