# Call Recorder

**Record, transcribe, and save every meeting — right inside your CRM.**

## ✨ What you get

- **Recordings on every meeting**
- **A Call Recording tab**
- **A per-meeting on/off switch**
- **Customizable in-meeting recording notices**
- **AI meeting summaries**
- **Call participants and recordings on record pages**
- **Built for AI & automation**

## 💳 Billing

Metered in Twenty credits based on the bot's actual recording time, prorated by
duration — **$1.00 per recording-hour** (1 credit). No recording — opted out,
canceled, or no-show — means no charge.

When the workspace cannot spend credits, each meeting is skipped shortly before
its bot would join: the bot is canceled, or never created, and the recording is
marked `NOT_RECORDED` with the reason. Later meetings are recorded again once
credits are available; the skipped meeting itself is not retried. A call that
is already being recorded is never cut short for credits.

AI summaries use workspace AI credits, billed on the model's token usage — the
cost scales with how much was said in the meeting, typically **$0.02–$0.06 per
meeting** on default models. Set the `CALL_RECORDER_SUMMARY_ENABLED` app
variable to `false` to turn summaries off.

## 🤖 The Recording Bot field

Each calendar event has a **Recording Bot** field. It starts blank and the app
sets it to Auto when it schedules the recorder for that meeting on its own,
which happens once the meeting is less than a day away. Set it to On to record
a meeting the app would not pick by itself, or to Off to skip a meeting. The
app only ever clears its own Auto: an On or Off you set stays until you change
it. Past meetings the recorder never joined simply stay blank.

The app schedules the recorder on its own only for meetings that are on a
calendar a workspace member connected. A meeting on no member's calendar, such
as one created through the API, stays blank until you set its Recording Bot
field to On.

## 🙋 Choosing which of your meetings are recorded

Each member decides for their own calendars. Under **Settings → Apps
preferences → Call Recorder**, **Meetings to record** is set to All my meetings
by default; choose None of my meetings to stop the recorder joining your
meetings on its own.

A meeting that several members have on their calendars is recorded as soon as
one of them chose to record it. The Recording Bot field of a meeting wins over
these preferences: On records it whatever its members chose, Off skips it. A
changed preference applies the next time the app checks upcoming meetings,
which happens twice a day and whenever a meeting changes.

## 👥 Calls on record pages

The app provides two record page widgets. Both read the meeting the recording
belongs to, so nothing is copied onto the recording.

- **Call participants** is added to the Home tab of call recording pages. It
  shows the meeting's attendees.
  People in your CRM open their record when clicked; workspace members are
  shown by name. Attendees that match no one are shown by name, or by email
  when the invite has no name.
- **Call recordings** lists the 20 most recent recordings of meetings linked
  to a person, company or opportunity. To show it, edit that record page's
  layout and add the widget from the layout editor.

## 🗓️ Pausing the recorder

The **Record my calendar meetings** toggle in the app settings is on
by default. Turn it off to stop scheduling bots for upcoming meetings and cancel
every recording that is already scheduled; an Auto on those meetings goes back
to blank, and an On or Off you set yourself is left alone. Turn it back on and
the app sweeps upcoming meetings to schedule bots again.

## 🎥 Supported meeting platforms

The recording bot can only join meetings on these platforms:

- ✅ Google Meet
- ✅ Zoom
- ✅ Microsoft Teams
- ✅ Webex
- ✅ GoTo Meeting

Events whose conference link points to any other platform (e.g. ro.am, Daily,
Whereby) or that only have a dial-in number are **ignored** — no bot is
scheduled, since it can't join the call.

Recording notices are supported in Zoom, Google Meet, and Microsoft Teams.
Workspace admins can turn them off or customize their text in the Call Recorder
app settings. Webex and GoTo Meeting do not support bot chat messages.

## 📌 Heads up

- **Needs a synced calendar + video link** — ad-hoc calls that were never on
  your Google, Outlook, or CalDAV calendar aren't recorded.
- **Your copy is yours** — Twenty stores its own video, audio, and transcript,
  so they stay available after the source media expires.
