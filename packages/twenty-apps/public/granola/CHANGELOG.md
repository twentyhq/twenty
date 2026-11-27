# Changelog

## 1.1.0

- Let each member connect their own Granola API key and choose folders in a new Folders tab. Notes created after they opt in sync to Call Recordings.
- Catch up personal sync and repair its webhooks daily.
- Remove members' personal webhooks when the app is uninstalled.
- Uninstall cleanly when no API key was saved.

## 1.0.0

- Connect a workspace or personal Granola API key; the key type is detected and the signed webhook is registered automatically.
- Synchronize shared summaries and speaker transcripts into Call Recordings with conservative calendar matching.
- Import 31 days automatically, request up to 3650 days manually, and catch up daily.
- Scope sync to selected folders and descendants.
- Expose note sync and listing to workflows and AI, plus folder listing to AI.
- Preserve deleted Twenty records and exclude private scratchpad notes.
