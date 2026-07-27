# Call Recorder

**Record, transcribe, and save every meeting — right inside your CRM.**

## ✨ What you get

- **Recordings on every meeting**
- **A Call Recording tab**
- **A per-meeting on/off switch**
- **AI meeting summaries**
- **Built for AI & automation**

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
