# Granola for Twenty

Implementation in progress. Sync meeting transcripts and shared summaries into Call Recordings, import history, and use notes in workflows and AI. Requires Granola Business or Enterprise and an API key. Private notes are excluded.

## Limitations

- One Granola API key serves the whole Twenty workspace. Members cannot connect their own Granola accounts, so every recording comes from the notes that key can see. Use a workspace key to cover a team.

When a Granola note matches multiple calendar event copies, the recording is imported without a calendar link because the app cannot determine which copy belongs to the note's owner.
