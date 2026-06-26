# Call Recorder

**Record, transcribe, and save every meeting — right inside your CRM.**

## ✨ What you get

- **Recordings on every meeting**
- **A Call Recording tab**
- **A per-meeting on/off switch**
- **AI meeting summaries** — a structured recap (overview, key points, decisions,
  action items) generated from the transcript and saved on each recording
- **Built for AI & automation**

## 🤖 Meeting summaries

When a recording's transcript is ready, Call Recorder asks an AI agent to write a
short structured recap and stores it on the **Summary** field of the Call
Recording. It's **on by default** — a workspace admin can turn it off by setting
the **Generate AI summaries** application variable (`CALL_RECORDER_SUMMARY_ENABLED`)
to `false` under **Settings → Applications → Call Recorder**.

Summaries use your workspace's AI credits (the same usage that powers AI
workflows and chat); there is no separate per-summary recording charge.

## 💳 Billing

Metered in Twenty credits based on the bot's actual recording time, prorated by
duration — **$1.00 per recording-hour** (1 credit). No recording — opted out,
canceled, or no-show — means no charge.

AI summaries are billed separately as AI token usage against your workspace's
credits, only when a summary is generated.

## 📌 Heads up

- **Needs a synced calendar + video link** — ad-hoc calls that were never on
  your Google, Outlook, or CalDAV calendar aren't recorded.
- **Your copy is yours** — Twenty stores its own video, audio, and transcript,
  so they stay available after the source media expires.

