# Granola

Bring meeting context into your CRM. Granola for Twenty imports shared meeting summaries and transcripts as Call Recordings, links unambiguous calendar matches, and keeps notes updated through signed webhooks and a daily catch-up.

## What you get

- One saved API key. The app detects whether it is a workspace or personal key, then creates and manages its signed webhook automatically.
- A 31-day initial import, plus manual imports of up to 3650 days in paced batches.
- Optional folder selection of up to 100 folders, including their subfolders, shared by live sync and imports.
- **Sync Granola Note** and **List Granola Notes** in workflows and AI; **List Granola Folders** in AI.
- Shared summaries and speaker transcripts. Private scratchpad notes are never imported.

## Requirements

Granola Business or Enterprise, Twenty 2.38.0 or newer, and permission to manage applications. Create a key in Granola under **Settings → Connectors → API keys**. Workspace keys reach workspace-visible notes and spaces with API access enabled. A personal key also reaches the owner's own notes and notes shared with them. The app detects the key type when it connects.

The Twenty server must have a public HTTPS URL for webhook delivery. See [the setup guide](https://github.com/twentyhq/twenty/blob/main/packages/twenty-apps/public/granola/SETUP.md).

## Heads up

- To change your API key, use the red trash button beside **Connected** in the settings, then connect the new one. The app attempts to delete the Granola webhook endpoint using the saved key before clearing it. If provider cleanup fails, check Granola for a leftover endpoint and remove it there.
- Granola drops events while an endpoint is paused, and the app never re-enables an endpoint on its own. The daily catch-up still imports notes updated in the last two days; use **Connect** in the settings to receive events again, and a larger manual import after a longer outage.
- Deleting or unsharing a note in Granola does not delete its Twenty recording. Recordings deleted in Twenty stay deleted during sync and imports.
- Transcript fallback supports up to 1,000 pages within an 800-second retrieval budget. Notes beyond either limit are skipped without saving a partial transcript.
- Granola exposes no recording audio or video. Notes without a transcript keep their summary and show no transcript in Twenty.
- The saved key powers every sync and action for the whole Twenty workspace, whether it is a workspace or personal Granola key. Choose it deliberately; there are no per-user connections.
