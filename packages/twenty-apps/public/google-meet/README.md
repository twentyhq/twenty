# Meet

**Your Google Meet transcripts and Gemini notes, right inside your CRM.**

## ✨ What you get

- **Google Meet transcripts and Gemini notes saved to Call Recordings**
- **New calls synced once Google has them ready, plus a daily catch-up**
- **Calendar links and titles for clear matches**
- **AI summaries for calls without Gemini notes**

## 💳 Billing

**Free.** AI summaries use AI credits. Each member can turn them off for their
own calls in **Settings**, under **Apps preferences**.

## 📌 Getting started

1. Install **Meet** from **Settings → Applications**.
2. Each member connects their own Google account from the app's settings.
3. Turn on transcription, or Gemini notes, in the calls you want imported.

**Self-hosting?** Your admin sets up a Google Cloud project, an OAuth client and
a Pub/Sub topic once, and needs a public HTTPS server URL: see the
[setup guide](https://github.com/twentyhq/twenty/blob/main/packages/twenty-apps/public/google-meet/SETUP.md).

## 📌 Heads up

- **Calls you organize.** Calls where you are only a guest are not imported.
  Calls from before you connect are imported only if they started in the last
  two days.
- **Imports are shared with your workspace.**
- **Calendar links need one clear match.** A Call Recording is linked to a
  calendar event only when its meeting link matches and its start time is
  closest to the call. Without a match, the call is named after its Gemini
  notes or transcript document.
- **Read-only access to Meet and Docs.** The app reads your conferences,
  transcripts and Gemini notes. In Twenty it reads Calendar Events and writes
  Call Recordings.
- **One workspace per Google account.** A second workspace connecting the same
  account only gets calls on the daily catch-up.
- **Transcripts and notes only.** Video recordings are not imported.
