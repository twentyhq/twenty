# Changelog

## 1.0.1

- Accept the Workspace Apps permission under its new `WORKSPACE_APPS` key as well as `APPLICATIONS`, so folder selection and webhook setup keep working once Twenty stops reporting `APPLICATIONS` (2.53 reports both).
- Uninstall without an API key now skips the Granola webhook cleanup instead of failing; remove any registered webhook in Granola settings.

## 1.0.0

- Connect a workspace or personal Granola API key; the key type is detected and the signed webhook is registered automatically.
- Synchronize shared summaries and speaker transcripts into Call Recordings with conservative calendar matching.
- Import 31 days automatically, request up to 3650 days manually, and catch up daily.
- Scope sync to selected folders and descendants.
- Expose note sync and listing to workflows and AI, plus folder listing to AI.
- Preserve deleted Twenty records and exclude private scratchpad notes.
