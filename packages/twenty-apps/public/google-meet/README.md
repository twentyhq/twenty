# Meet

**Your Google Meet transcripts and Gemini notes, right inside your CRM.**

This app is under construction. It imports the transcript and Gemini notes of
the Google Meet calls a member organized into Call Recordings, and writes an AI
summary for calls without Gemini notes; recordings are not imported yet.

See [SETUP.md](./SETUP.md) for the Google Cloud and server configuration.

## Local development

```sh
yarn install --immutable
yarn lint
yarn typecheck
twenty app build
```
