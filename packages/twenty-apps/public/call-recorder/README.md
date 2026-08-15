# Call Recorder

**Record, transcribe, and save every meeting — right inside your CRM.**

## ✨ What you get

- **Recordings on every meeting**
- **A Call Recording tab**
- **A per-meeting on/off switch**
- **AI meeting summaries**
- **Built for AI & automation**

## 🔒 Privacy controls

Recording is **on by default**, and every layer of it can be turned off:

- Each meeting has a **Recording Bot** field. Set it to **Off** and the bot
  stays out of that call (a bot already scheduled is canceled). Set it to
  **On** to record the meeting regardless of the workspace default. Left
  empty, the meeting follows the workspace default.
- Workspace admins can flip the `CALL_RECORDER_RECORD_BY_DEFAULT` app setting
  to **off** to make recording opt-in per meeting across the whole workspace —
  the bot then only joins meetings explicitly set to **On**.
- The bot joins visibly, as a named participant everyone can see.
- Recording laws vary by place — make sure participants get the notice your
  jurisdiction requires.

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
