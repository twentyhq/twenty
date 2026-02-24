# Zoom Folder Usage Report

**Folder:** `ri.compass.main.folder.a26249ff-6269-4861-8520-b542e0e0f1d3`
**Date:** 2026-02-25
**Method:** `updated_time` from Foundry resource inventory (last write/build activity). Cutoff: 3 months (before 2025-11-25).

**Summary:** 94 resources total. **30 active, 64 stale.**

---

## Active Resources (30)

Updated within the last 3 months. These are in use — pipelines are building them or users are editing them.

### Core Ontology-Backing Datasets (21) — updated daily/weekly

| Last Updated | Name | RID |
|---|---|---|
| 2026-02-23 | Transcript [Zoom] schedule build target | `ri.foundry.main.dataset.878c153a-1913-41bc-89b8-0297c95c0688` |
| 2026-02-23 | [Zoom] Meetings RV input | `ri.foundry.main.dataset.b4525056-8555-4f08-acc1-0dec068cfbaa` |
| 2026-02-23 | Transcript [Zoom] backing dataset (latest-unioned) | `ri.foundry.main.dataset.5c19ca8d-98a9-4a68-aff0-f6ab8bf2422a` |
| 2026-02-23 | Transcript [Zoom] dataset - new | `ri.foundry.main.dataset.1266594f-3cbb-48bb-bbbd-2b5e286871d7` |
| 2026-02-23 | zoom.transcripts.summary_eng | `ri.foundry.main.dataset.36d038d9-d340-4970-ac06-636e65bd1139` |
| 2026-02-23 | Meeting Participant [Zoom] object type backing datasource | `ri.foundry.main.dataset.3ee3a3ab-201d-4476-a4d4-e5b640edff92` |
| 2026-02-23 | zoom.transcripts.summary | `ri.foundry.main.dataset.57b5e643-7942-4aab-9b0b-a98bec5e4591` |
| 2026-02-23 | [Zoom] Event Session object type backing datasource | `ri.foundry.main.dataset.79ce12ea-f44f-4233-9da5-484c48239844` |
| 2026-02-23 | Recording [Zoom] object type backing datasource | `ri.foundry.main.dataset.d943eb00-f065-4e90-8d3b-58412920cb94` |
| 2026-02-23 | [Zoom] Tickets object type backing datasource | `ri.foundry.main.dataset.1ed27e23-4657-4c48-88c5-121735e9131c` |
| 2026-02-23 | zoom.transcripts.clean | `ri.foundry.main.dataset.41e057ac-c9e6-4ad3-8f0d-0a7b7664538c` |
| 2026-02-23 | [Zoom] Event object type backing datasource | `ri.foundry.main.dataset.dd5179a3-ecad-492e-a002-10d63a9d6a8e` |
| 2026-02-22 | zoom.transcripts.executive_summary | `ri.foundry.main.dataset.77e92e34-3d52-46f7-b249-f3151f69117e` |
| 2026-02-22 | zoom.transcripts.executive_hosts_filtered | `ri.foundry.main.dataset.62d855ed-bd10-4989-8b75-aa9498cd6bd9` |
| 2026-02-22 | ont.zoom.chat.core | `ri.foundry.main.dataset.844eb50a-c1a3-4a02-b40e-976fd34eac48` |
| 2026-02-22 | [Zoom] Participation Metrics object type backing datasource | `ri.foundry.main.dataset.c928e708-53bd-49cb-857b-e9c2c496b8dd` |
| 2026-02-22 | Meeting Participation Segment [Zoom] object type backing datasource | `ri.foundry.main.dataset.bc09ddf9-9e8d-4227-bfdb-67f1b7aa2122` |
| 2026-02-22 | [Zoom][Writeback] Survey Question | `ri.foundry.main.dataset.3364a840-973f-47ba-9e3e-ff65b78a665f` |
| 2026-02-22 | [Zoom] Survey Q&A object type backing datasource | `ri.foundry.main.dataset.03091f70-c346-49c0-b0fc-1cbd97c4693b` |
| 2026-02-22 | [Zoom] Survey Question object type backing datasource | `ri.foundry.main.dataset.103bbbb6-584f-4c7d-ab1c-d43b49526427` |
| 2026-02-22 | [Zoom] Q&A object type backing datasource | `ri.foundry.main.dataset.12fb612a-4fb8-4e23-8b08-bc4cea133935` |

### Pipeline & Infrastructure (9) — updated in last 3 months

| Last Updated | Type | Name |
|---|---|---|
| 2026-01-20 | EDDIE_PIPELINE | Zoom - Restricted View |
| 2026-01-20 | FOUNDRY_DATASET | Transcript Segment [Zoom] object type backing datasource |
| 2026-01-20 | FOUNDRY_DATASET | [depr] zoom_event_attendance *(named depr but still being built — verify if intentional)* |
| 2026-01-16 | MONOCLE_GRAPH | [Zoom] Payload 2x Schedule Analysis - Zoom Event Attendance to MOP |
| 2026-01-14 | MONOCLE_GRAPH | Zoom - new transcripts schedule lineage |
| 2026-01-14 | FOUNDRY_DATASET | Transcript [Zoom] object type backing datasource |
| 2026-01-13 | FOUNDRY_DATASET | zoom.transcripts.short_summary |
| 2025-12-18 | COMPASS_FOLDER | 04 - Documentation |
| 2025-12-01 | FOUNDRY_DATASET | link-table transcript-participants |

---

## Stale Resources (64)

Not updated in 3+ months. Candidates for cleanup or archival.

### Trashed (6) — safe to permanently delete

| Last Updated | Name |
|---|---|
| 2026-01-14 | Checkpoint for filter stale date |
| 2025-09-23 | test csv |
| 2025-08-08 | Participation Event [Zoom] object type backing datasource |
| 2025-06-30 | participation_segment |
| 2025-06-24 | sample__whatsapp |
| 2025-06-24 | sample__zoom_chat_messages |

### Deprecated (4) — marked [DEPR], confirm then delete

| Last Updated | Name |
|---|---|
| 2025-11-19 | DEPR Meeting [Zoom] object type backing datasource |
| 2025-09-08 | [DEPR][Zoom]Metrics object type backing datasource |
| 2025-08-29 | [DEPR] Zoom Survey Question object type backing datasource |
| 2025-08-29 | [DEPR] Zoom Survey object type backing datasource |

### Test artifacts (8) — one-off explorations, safe to delete

| Last Updated | Name |
|---|---|
| 2025-10-07 | New Analysis - 2025-10-07 16:39:17 |
| 2025-10-01 | New Analysis - 2025-10-01 18:29:15 |
| 2025-10-01 | New Analysis - 2025-10-01 09:58:19 |
| 2025-09-10 | New Analysis - 2025-09-10 22:02:47 |
| 2025-09-08 | New Analysis - 2025-09-08 15:42:41 |
| 2025-08-26 | test api |
| 2025-07-14 | Test Zapier |
| 2025-07-14 | New dataset Mon, Jul 14, 2025, 3:44:43 PM |
| 2025-06-01 | sample__zoom_survey |

### Stale — review before deleting (46)

These haven't been updated in 3+ months but aren't marked deprecated or test. Some may be referenced by active pipelines as intermediate datasets, or may contain data worth preserving.

| Last Updated | Type | Name | Notes |
|---|---|---|---|
| 2025-11-23 | VECTOR_WORKBOOK | Extract Zoom Recording Download Links | Manual tool — may still be used on demand |
| 2025-11-18 | COMPASS_FOLDER | 00 - Data | Folder — check if it has active children outside this scope |
| 2025-10-21 | FOUNDRY_DATASET | Hosts | Static reference data — may still be read |
| 2025-10-21 | FUSION_DOCUMENT | Hosts Fusion Sheet | Source for Hosts dataset |
| 2025-10-21 | FFORMS_FORM | selected2 | Form — unclear purpose |
| 2025-09-29 | FOUNDRY_DATASET | CSIC - Coaching Session Insight Chunk (x2) | Coaching insights — not Zoom core, may belong elsewhere |
| 2025-09-11 | WORKSHOP_MODULE | Lead Session Participation Tagger | App — check if users still access it |
| 2025-09-10 | CONTOUR_ANALYSIS | Chat_Messages_begleiter_Zoom-Abendprogramm Tag 11 | One-off analysis |
| 2025-09-03 | COMPASS_FOLDER | 02 - Pipelines | Empty organizational folder |
| 2025-09-03 | COMPASS_FOLDER | 03 - Functions | Empty organizational folder |
| 2025-09-03 | COMPASS_FOLDER | 09 - Custom Analysis | Empty organizational folder |
| 2025-08-31 | FOUNDRY_DATASET | [Classified] WhatsApp object type backing datasource | WhatsApp data — doesn't belong in Zoom folder |
| 2025-08-31 | FOUNDRY_DATASET | classified whatsapp | Duplicate of above |
| 2025-08-29 | FOUNDRY_DATASET | Survey Question object type backing datasource | Likely superseded by [Zoom] Survey Question (active) |
| 2025-08-28 | FOUNDRY_DATASET | webhook_api_diff | Dev/debug artifact |
| 2025-08-25 | CONTOUR_ANALYSIS | Leads with more than 1 ticket | One-off analysis, not Zoom specific |
| 2025-08-04 | STEMMA_REPOSITORY | Repo_MariaDB | Code repo — check if still deployed |
| 2025-07-15 | FOUNDRY_DATASET | CSIC - Coaching Session Insight Chunk OT backing | Second CSIC backing dataset |
| 2025-07-14 | FOUNDRY_DATASET | Middle Step for Computing | Intermediate pipeline artifact |
| 2025-07-14 | MAGRITTE_SOURCE | Zapier API | Data source connector — check if still needed |
| 2025-07-13 | COMPASS_FOLDER | workbook-output | Empty folder |
| 2025-06-29 | FOUNDRY_DATASET | chat_messages_clean v2 | Likely superseded by ont.zoom.chat.core (active) |
| 2025-06-24 | FOUNDRY_DATASET | [Classified] Zoom Chats object type backing datasource | LLM-classified chats — superseded? |
| 2025-06-24 | FOUNDRY_DATASET | ChatMessageInsightClassified_direct | LLM classification output |
| 2025-06-05 | FOUNDRY_DATASET | v2 classified Survey | Superseded by active survey datasets |
| 2025-06-05 | FOUNDRY_DATASET | [Classified] Zoom Surveys object type backing datasource - ae6718 | Superseded |
| 2025-06-01 | FOUNDRY_DATASET | surveys_filtered | Intermediate pipeline artifact |
| 2025-06-01 | FOUNDRY_DATASET | ALL_ZoomSurveyKeepClassifier | LLM classifier output |
| 2025-05-31 | FOUNDRY_DATASET | [Classified] Schmerzfrei Umfrage Unpivotiert OT backing | Not Zoom — belongs in Strukturanalyse |
| 2025-05-31 | FOUNDRY_DATASET | Classified WhatsApp Chats | Not Zoom — belongs in WAHA |
| 2025-05-31 | FOUNDRY_DATASET | [Classified] Zoom Surveys object type backing datasource | Superseded by active version |
| 2025-05-31 | FOUNDRY_DATASET | [Classified] Zoom Messages object type backing datasource | Superseded |
| 2025-05-31 | FUSION_DOCUMENT | ManExt Ergebnisse | Manual extraction results — one-time |
| 2025-05-31 | FOUNDRY_DATASET | ChatMessageInsightClassifier_Michelle | Named after a person — one-off experiment |
| 2025-05-31 | FOUNDRY_DATASET | Zoom Chats LLM v0.01 | v0.01 — clearly superseded |
| 2025-05-30 | COMPASS_FOLDER | Manual Uploads CSV | Empty folder |
| 2025-05-26 | EDDIE_LOGIC | AIP_Survey | AIP logic — check if still referenced |
| 2025-05-24 | FOUNDRY_DATASET | qa pairs | Small dataset — unclear purpose |
| 2025-05-17 | COMPASS_FOLDER | UseCase Engel | Named after a person — likely personal sandbox |
| 2025-05-13 | FOUNDRY_DATASET | Zoom Messages Incremental OT backing datasource | Superseded by non-incremental version |
| 2025-05-13 | FOUNDRY_DATASET | Zoom Meeting Started Incremental OT backing datasource | Superseded |
| 2025-05-12 | COMPASS_FOLDER | Outputs Zoom Raw | Empty folder |
| 2025-05-12 | COMPASS_FOLDER | Pipeline Outputs | Empty folder |
| 2025-05-12 | MONOCLE_GRAPH | Lineage v3 Ontology | Old lineage graph — superseded by active ones |

---

## Flags

- **`[depr] zoom_event_attendance`** is marked active (last built 2026-01-20) despite having `[depr]` in its name. Verify if this pipeline should be stopped.
- **WhatsApp/Schmerzfrei datasets** in this Zoom folder appear misplaced — they belong in their respective domain folders.
- **CSIC (Coaching Session Insight Chunk)** datasets also seem misplaced — they're coaching-related, not Zoom-related.

---

*Based on `foundry_resources.csv` (exported 2026-02-24). Read-access patterns from audit logs not yet incorporated — this analysis covers write/build activity only.*
