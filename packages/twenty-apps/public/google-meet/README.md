# Meet

**Your Google Meet transcripts, Gemini notes and recordings, right inside your CRM.**

## ⚠️ Check your Google plan first

Meet only makes transcripts, Gemini notes and recordings on paid Google plans,
and this app imports what Meet makes. What you get depends on the plan of the
person who **organizes** the call:

| Organizer's Google plan                                          | Transcripts | Gemini notes | Recordings |
| ---------------------------------------------------------------- | ----------- | ------------ | ---------- |
| Workspace Business Starter, Google AI Plus, free Gmail           | No          | No           | No         |
| Workspace Business Standard or Plus, Enterprise Standard or Plus | Yes         | Yes          | Yes        |
| Google AI Pro or Ultra                                           | Yes         | Yes          | Yes        |

## ✨ What you get

- **Google Meet transcripts, Gemini notes and recording videos saved to Call Recordings**
- **Each call linked to its calendar event**
- **AI summaries for calls without Gemini notes**

## 💳 Billing

**Free.** AI summaries use AI credits. Each member can turn them off for their
own calls in **Settings**, under **Apps preferences**.

## 📌 Getting started

1. Install **Meet** from **Settings → Applications**.
2. Each member connects their own Google account from the app's settings.
3. Turn on transcription, Gemini notes or recording in the calls you want
   imported.

**Self-hosting?** Your admin sets up a Google Cloud project, an OAuth client and
a Pub/Sub topic once, and needs a public HTTPS server URL: see the
[setup guide](https://github.com/twentyhq/twenty/blob/main/packages/twenty-apps/public/google-meet/SETUP.md).

## 📌 Heads up

- **Calls you organize.** Calls where you are only a guest are not imported.
  Calls from before you connect are imported only if they started in the last
  two days.
- **Imports are shared with your workspace.**
- **One video per call.** The first recording of a call is imported, up to
  500 MB.
- **Needs a paid Google plan.** The organizer needs a Google Workspace plan
  with Meet transcripts or recording, or Google AI Pro or Ultra for Gemini
  notes.
