# Changelog

All notable changes to this application are documented in this file.

## 0.1.0

- Import a Microsoft Teams meeting transcript from Microsoft Graph into an
  idempotent Twenty Call Recording linked to the matching Calendar Event.
- Parse speaker-attributed and unattributed WebVTT into transcript entries.
- Generate an AI summary when a transcript lands on a Call Recording created
  by this app.
- Add the List Teams Transcripts By Organizer and Sync Teams Transcript
  workflow and AI actions.
- Add a probe script to measure how far back Graph returns transcripts.
