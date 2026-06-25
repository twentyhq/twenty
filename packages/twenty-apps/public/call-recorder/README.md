# Call Recorder

**Record, transcribe, and save every meeting — right inside your CRM.**

Call Recorder sends a bot to your calendar meetings and drops the video, audio,
and a speaker-by-speaker transcript onto the meeting in Twenty. No more
note-scrambling — every call is captured, searchable, and ready for your team,
your AI agents, and your workflows to act on.

## ✨ What you get

- **Recordings on every meeting** — video, audio, and a speaker-attributed
  transcript, attached to the calendar event.
- **A Call Recording tab** — watch it back with a timestamped transcript that
  scrolls in sync with the video.
- **A per-meeting on/off switch** — on by default; flip it off to keep a
  meeting private.
- **Built for AI & automation** — transcripts live in your CRM, so agents and
  workflows can summarize calls, pull action items, and update records.

## ⚙️ How it works

It's automatic. Once an admin installs the app, every eligible meeting is
recorded — nobody has to hit record.

A meeting is recorded when it's on a connected calendar, has a video link (Zoom,
Google Meet, Teams), hasn't started yet, and its **Recording** switch is on. The
bot joins just before the call, records it, and when it ends the recording and
transcript land on the meeting. Change the time, link, or switch and Call
Recorder keeps up automatically.

**Don't want one recorded?** Switch **Recording** off on the event — any
scheduled bot is canceled.

## 💳 Billing

Metered and fair: **1 credit per hour of recording**, charged on actual call
length. Meetings that were opted out, canceled, or that nobody joined are free.

## 🚀 Install

1. Open **Settings → Applications** in Twenty.
2. Find **Call Recorder** → **Install**.
3. A server admin does a one-time setup to connect the recording service (on
   Twenty Cloud, this may already be done).

## 🔧 Customize

A workspace admin can tune the bot in **Settings → Applications → Call
Recorder** — every setting has a sensible default:

- **Bot display name** — shown when it joins. `CALL_RECORDER_NAME` · `Twenty.com`
- **Join early** — minutes before start it joins (`0` = at start).
  `CALL_RECORDER_JOIN_EARLY_MINUTES` · `1`
- **Lobby wait** — seconds it waits to be admitted.
  `CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS` · `1200`
- **Empty-meeting wait** — seconds it stays if no one joins.
  `CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS` · `1200`
- **Leave after everyone's gone** — seconds it records after all leave.
  `CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS` · `2`

## 📌 Good to know

- **Workspace-wide for now** — every eligible meeting records by default;
  control is per-meeting via the switch. A per-person toggle is coming later.
- **Needs a synced calendar + video link** — ad-hoc calls that were never on
  your Google, Outlook, or CalDAV calendar aren't recorded.
- **Your copy is yours** — Twenty stores its own video, audio, and transcript,
  so they stay available after the source media expires.

---

🛠️ **Server admins:** see [SETUP.md](https://github.com/twentyhq/twenty/blob/main/packages/twenty-apps/public/call-recorder/SETUP.md)
to connect the recording service, set credentials, and wire up webhooks.
