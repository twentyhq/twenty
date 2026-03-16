# Task 5 — Meeting Transcripts Viewer

**Status:** DONE — all 7 feedback items implemented, deployed, and approved by Pablo
**Assigned to:** Saba
**Last updated:** 2026-03-16

---

## 1. What Was Built

A custom Meeting Transcripts viewer page inside Twenty CRM. It displays Zoom meeting transcripts with bilingual summaries, speaker segments, and meeting metadata in a split-panel layout.

### 1.1 Features

| Feature | Description |
|---------|------------|
| Split-panel layout | Left panel (meeting list) + right panel (meeting detail) |
| Meeting list | Paginated list of meetings with name, ID, date |
| Meeting detail | Full metadata: UUID, start/end times, duration, host, topic |
| Participants | List of participants with count |
| Bilingual summaries | English (Summary EN) + German (Summary DE / Zusammenfassung) |
| Full transcript | Rendered with speaker identification and timestamps |
| Filters | Search by term, topic, host email, participant, meeting ID, date range |
| Missing object handling | Shows friendly error if Meeting object not created in workspace |

### 1.2 Data Fields

| Field | Type | Description |
|-------|------|------------|
| name | string | Meeting title |
| meetingUuid | string | Unique meeting identifier |
| meetingStartTime | string | Start timestamp |
| meetingEndTime | string | End timestamp |
| meetingDuration | string | Duration |
| hostEmail | string | Host email address |
| meetingTopic | string | Topic |
| participants | string | Participant list |
| participantCount | number | Number of participants |
| speakerCount | number | Number of speakers |
| summaryEng | string | English summary |
| zusammenfassung | string | German summary |
| zusammenfassungLang | string | Long German summary |
| transcriptText | string | Full transcript text |

---

## 2. Key Files

| File | Purpose |
|------|---------|
| `packages/twenty-front/src/pages/meeting-transcripts/MeetingTranscriptsPage.tsx` | Page wrapper |
| `packages/twenty-front/src/modules/meeting-transcripts/components/MeetingTranscriptsBody.tsx` | Layout container (left + right panels) |
| `packages/twenty-front/src/modules/meeting-transcripts/components/MeetingTranscriptsLeftPanel.tsx` | Left sidebar |
| `packages/twenty-front/src/modules/meeting-transcripts/components/MeetingTranscriptsList.tsx` | Paginated meeting list |
| `packages/twenty-front/src/modules/meeting-transcripts/components/MeetingTranscriptsListItem.tsx` | Meeting preview card |
| `packages/twenty-front/src/modules/meeting-transcripts/components/MeetingTranscriptsRightPanel.tsx` | Detail panel |
| `packages/twenty-front/src/modules/meeting-transcripts/components/MeetingTranscriptsDetail.tsx` | Meeting metadata + summaries |
| `packages/twenty-front/src/modules/meeting-transcripts/components/MeetingTranscriptsTranscriptRenderer.tsx` | Transcript with speaker/timestamp rendering |
| `packages/twenty-front/src/modules/meeting-transcripts/components/MeetingTranscriptsFilterBar.tsx` | Search and filter controls |
| `packages/twenty-front/src/modules/meeting-transcripts/components/MeetingTranscriptsEmptyDetail.tsx` | Empty state placeholder |
| `packages/twenty-front/src/modules/meeting-transcripts/types/meeting-transcripts.types.ts` | TypeScript types |
| `packages/twenty-front/src/modules/meeting-transcripts/hooks/useMeetingTranscriptsList.ts` | List fetching with pagination |
| `packages/twenty-front/src/modules/meeting-transcripts/hooks/useMeetingTranscriptDetail.ts` | Single meeting detail fetching |
| `packages/twenty-front/src/modules/meeting-transcripts/hooks/useMeetingObjectExists.ts` | Checks if Meeting object exists |
| `packages/twenty-front/src/modules/meeting-transcripts/utils/build-meeting-filter.util.ts` | Builds GraphQL filter from filter values |
| `packages/twenty-front/src/modules/meeting-transcripts/utils/parse-transcript.util.ts` | Parses transcript into speaker/timestamp segments |
| `packages/twenty-front/src/modules/meeting-transcripts/constants/MeetingObjectNameSingular.constants.ts` | Object name: `tobMeetingTranscript` |
| `packages/twenty-front/src/modules/meeting-transcripts/constants/MeetingListGqlFields.constants.ts` | GraphQL fields for list view |
| `packages/twenty-front/src/modules/meeting-transcripts/constants/MeetingDetailGqlFields.constants.ts` | GraphQL fields for detail view |
| `packages/twenty-front/src/modules/meeting-transcripts/constants/MeetingListPageSize.constants.ts` | Page size constant |
| `packages/twenty-front/src/modules/meeting-transcripts/constants/InitialFilterValues.constants.ts` | Default filter values |

---

## 3. Screenshots

| Screenshot | Description |
|-----------|------------|
| `meeting-transcripts-detail-view.png` | Detail view showing meeting metadata, participants, and summary |
| `meeting-transcripts-filtered.png` | Filtered list (search by "sprint") |
| `meeting-transcripts-missing-object.png` | Error state when Meeting object not created in workspace |

---

## 4. Timeline

| Date | What Happened |
|------|--------------|
| 2026-03-12 | Built Meeting Transcripts viewer page (on Coder) |
| 2026-03-12 | Fixed: correct production object name (`tobMeetingTranscript`) |
| 2026-03-12 | Fixed: re-added route and nav item lost during merge |
| 2026-03-12 | Fixed: removed Lingui i18n macros, used plain strings |
| 2026-03-12 | Fixed: correct production API field names |
| 2026-03-13 | Received feedback from Pablo (7 items) |

---

## 5. Feedback from Pablo (2026-03-13)

| # | Feedback | Current State | What To Do |
|---|----------|--------------|------------|
| 1 | No button to access the app — create a folder containing the app and the Meeting Transcript dataset | Nav item exists but not grouped | Create a folder/group in sidebar with the app and dataset |
| 2 | Meeting list should be card-style UI, clearly differentiate meetings | Simple list items | Redesign list items as distinct cards |
| 3 | Meeting cards should show date AND time, not just date | Only date shown | Add time to card display |
| 4 | Scrolling hits a limit, no more meetings load | Pagination bug | Fix infinite scroll / load-more pagination |
| 5 | Participants should be individual cards with participation metrics | Plain text list | Redesign as cards (like Pablo's reference screenshot) |
| 6 | Every section on the right panel should be collapsible | Not collapsible | Add collapse/expand toggle per section |
| 7 | Every section on the right panel should have a copy button | No copy buttons | Add copy-to-clipboard button per section |

Reference screenshots from Pablo's external app saved in `Saba Documentations/Screenshots/`.

---

## 6. Next Action

Implement all 7 feedback items, then merge to main.
