# Microsoft Teams

**Your Microsoft Teams meeting transcripts and AI summaries, right inside your CRM.**

## ✨ What you get

- **Teams transcripts saved to Call Recordings**, with calendar links when the
  meeting is synced in Twenty
- **New transcripts synced as Microsoft publishes them**
- **Your last 31 days imported when you connect**
- **Optional AI summaries**, plus **Generate call summary** to write or rewrite
  summaries from Call Recordings and calendar events
- **List My Teams Transcripts** and **Sync Teams Transcript** actions for AI chat
  and workflows

## 💳 Billing

**Free to run**: no per-seat, per-transcript or per-import charge. Optional AI
summaries and AI actions use AI credits based on the model's token usage.
Summaries are off by default.

## 📌 Getting started

1. Install **Microsoft Teams** from **Settings → Applications**.
2. Have your Microsoft 365 admin enable **Microsoft Graph access** under
   **Teams admin center → Meetings → Meeting settings → Transcript API access**.
   Enable **Include speaker attribution** there to import speaker names too.
   Your organization may also require admin consent when connecting.
3. Open the app's **Settings** tab, click **Add connection**, and sign in with
   your Microsoft work or school account. Your last 31 days of transcripts
   start importing, and new transcripts sync automatically.
4. To add AI summaries, turn on **Enable transcript summaries** in the app's
   **Settings** tab. Use **Generate call summary** on existing Teams Call
   Recordings or their calendar events to summarize them, up to 20 calls at a
   time.

**Self-hosting?** Your admin registers the Microsoft app and configures a public
HTTPS server URL first: see the
[setup guide](https://github.com/twentyhq/twenty/blob/main/packages/twenty-apps/public/teams/SETUP.md).

## 📌 Heads up

- **Work or school accounts, and meetings you organize.** Personal Microsoft
  accounts and meetings where you are only an attendee are not supported.
  Start transcription in Teams during the scheduled meeting; the app imports
  the transcript Microsoft creates.
- **Imports are shared with your workspace.** Transcripts and summaries land on
  Call Recordings that members with access can read, including imports from a
  personal connection.
- **Transcripts and summaries only.** Audio and video are not imported. The
  Teams chat assistant and the settings control for importing older history
  are not available in this release.
- **Calendar links need a synced meeting.** A transcript can import without a
  calendar link. For a recurring meeting, it links to the series' event.
- **Deleting a Call Recording keeps it deleted.** Syncing the same transcript
  again updates the existing record but does not restore one deleted in Twenty.
