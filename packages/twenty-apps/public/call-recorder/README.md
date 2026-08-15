# Call Recorder

**Record, transcribe, and save your meetings — right inside your CRM.**

## ✨ What you get

- **Recordings on the meetings you choose**
- **A Call Recording tab**
- **A per-meeting on/off switch**
- **AI meeting summaries**
- **Built for AI & automation**

## 🔒 Private by default

The bot doesn't record anything until you ask it to:

- Each calendar event has a **Recording Bot** field: **On**, **Off**, or
  **Auto** (the default). Auto follows the workspace-level
  `CALL_RECORDER_AUTO_RECORD_ENABLED` app setting, which ships **off** — so
  out of the box, only meetings you explicitly set to **On** are recorded.
- Workspace admins who want every eligible meeting captured can enable
  `CALL_RECORDER_AUTO_RECORD_ENABLED`; individual meetings set to **Off** are
  still never recorded.
- The bot joins visibly, as a named participant everyone can see.
- Recording laws vary by place — make sure participants get the notice your
  jurisdiction requires before turning recording on.

What is captured, who processes it, and how long it is retained are documented
in [PRIVACY.md](./PRIVACY.md).

## 💳 Billing

Metered in Twenty credits based on the bot's actual recording time, prorated by
duration — **$1.00 per recording-hour** (1 credit). No recording — opted out,
canceled, or no-show — means no charge.

AI summaries use workspace AI credits, billed on the model's token usage — the
cost scales with how much was said in the meeting, typically **$0.02–$0.06 per
meeting** on default models. Set the `CALL_RECORDER_SUMMARY_ENABLED` app
variable to `false` to turn summaries off.

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

## 📌 Heads up

- **Needs a synced calendar + video link** — ad-hoc calls that were never on
  your Google, Outlook, or CalDAV calendar aren't recorded.
- **Your copy is yours** — Twenty stores its own video, audio, and transcript,
  so they stay available after the source media expires.
