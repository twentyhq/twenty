// All universalIdentifier UUIDs for the Stratum Sales Notes app live here.
// Generated 2026-04-27. Do NOT change once deployed — these IDs are how the
// server tracks the app's metadata across reinstalls.

// ─── App ─────────────────────────────────────────────────────────────────────
export const APP_DISPLAY_NAME = 'Stratum Sales Notes';
export const APP_DESCRIPTION =
  'Sales-rep call/meeting notes, AI-summarised, with one-click task extraction. Foundation for issues #102 and #103.';
export const APPLICATION_UNIVERSAL_IDENTIFIER =
  '320258a6-016d-4a5a-80ce-a80306cbaf3c';
export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  'bc383811-aa4b-42b9-8c6e-695e634debe3';

// ─── Object: salesNote ───────────────────────────────────────────────────────
export const SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER =
  '92ffca54-27a7-4001-b6a0-cff586507354';
export const SALES_NOTE_NAME_FIELD_UID = '945c2547-9309-462e-a6a2-433bc3c83e40';
export const SALES_NOTE_BODY_FIELD_UID = '1db8d4fb-81ee-4e7b-8cd7-f6ec76e71cc0';
export const SALES_NOTE_SUMMARY_FIELD_UID =
  '93180c19-19ad-47eb-a97a-b322e6240e53';
export const SALES_NOTE_STATUS_FIELD_UID =
  'cd766ae8-e7c0-4b50-a357-5f1e7153f14c';
export const SALES_NOTE_AUDIO_FILE_FIELD_UID =
  '331de1be-f4e2-47c8-a09b-8f1b98d5a977';
// v0.3.0 — Voicenotes integration. External id from the inbound webhook;
// used as the idempotency key on retries and to match update / summary
// events back to the right salesNote.
export const SALES_NOTE_VOICENOTES_ID_FIELD_UID =
  'fbec23d9-40f6-4511-a3af-cdd78411e29f';

// New widget UIDs for the Notes-editor tab added in v0.1.2
export const SALES_NOTE_TAB_NOTES_EDITOR_UID =
  '3e918756-6bf0-4ea6-8708-fea474b99fb2';
export const SALES_NOTE_NOTES_EDITOR_WIDGET_UID =
  'bb929812-7592-46ce-a8b1-e5545a21b290';

// v0.1.3 — split the Tasks tab into "Extract" + "Linked Tasks" so each tab has
// one widget (Twenty's full-page record view appears not to render multiple
// widgets in one CANVAS tab; a single FRONT_COMPONENT widget per tab works).
export const SALES_NOTE_TAB_LINKED_TASKS_UID =
  '3c719c83-5c33-4ca2-baa5-9cdda180cf21';
export const SALES_NOTE_LINKED_TASKS_WIDGET_UID =
  '832d8081-cda0-45b0-a8c9-a54e6a550547';

// v0.1.6 — index view + nav menu item so salesNote shows in left sidebar
// and the side panel renders all the relation fields.
export const SALES_NOTE_VIEW_UID = 'cf0ed268-2fd9-429b-8375-527f996503e9';
export const SALES_NOTE_NAV_MENU_ITEM_UID =
  '59e20f8b-c811-4621-afab-4b175df7caa6';
export const VIEW_FIELD_NAME_UID = 'a59dbd9f-425c-4bff-b9e6-06b6ca76ae0c';
export const VIEW_FIELD_BODY_UID = 'dc54aaf0-e254-4cce-9e60-4a53d7cdc32c';
export const VIEW_FIELD_SUMMARY_UID = '0bf4f7d4-189a-4ded-a4cc-8ca282837ad7';
export const VIEW_FIELD_STATUS_UID = '117dc5cd-bd89-45f7-8a3f-34168aa1c383';
export const VIEW_FIELD_OWNER_UID = 'f0b1841d-cd69-4b20-b75d-4a1b73833ab9';
export const VIEW_FIELD_ATTENDEES_UID = 'c06b5af7-d1fc-408f-999f-839281f8f194';
export const VIEW_FIELD_COMPANY_UID = '89dc6b63-6914-4038-96fa-ea84a2e537dd';
export const VIEW_FIELD_OPPORTUNITY_UID =
  '46eae664-1f71-4d2f-b1ca-0a42148f026a';

// SELECT option ids (status)
export const SALES_NOTE_STATUS_DRAFT_OPTION_ID =
  '2468d32b-4859-4dd6-bdee-d2fff4745125';
export const SALES_NOTE_STATUS_FINAL_OPTION_ID =
  '92a5cb73-916b-4395-8d19-8fcae4df2ba3';

// ─── Object: salesNoteAttendee (junction salesNote ↔ Person) ─────────────────
export const SALES_NOTE_ATTENDEE_OBJECT_UID =
  'e2e3dbfa-4a98-49b1-9713-ef35a766679b';
export const SALES_NOTE_ATTENDEE_NAME_FIELD_UID =
  '57c6c943-8f23-428b-922c-1781ec9fc761';
// Junction relations:
export const ATTENDEE_TO_SALES_NOTE_FIELD_UID =
  '87b72167-139b-4a20-af8a-c14866d2a5af'; // M2O salesNoteAttendee → salesNote
export const SALES_NOTE_ATTENDEES_FIELD_UID =
  '0c1bc087-a93b-4a65-9ac8-4478823f7dbe'; // O2M salesNote → salesNoteAttendees
export const ATTENDEE_TO_PERSON_FIELD_UID =
  '905b4c24-1d26-4884-a5e3-3c0b0808cef5'; // M2O salesNoteAttendee → Person
export const PERSON_TO_ATTENDEES_FIELD_UID =
  '40c7cbe9-7c87-4ed8-b433-b3151d1673bb'; // O2M Person → salesNoteAttendees

// ─── salesNote → Company (account) ───────────────────────────────────────────
export const SALES_NOTE_TO_COMPANY_FIELD_UID =
  '32e47e37-f297-48ac-9d71-fc32302606d0'; // M2O on salesNote
export const COMPANY_TO_SALES_NOTES_FIELD_UID =
  'eb180820-500a-4726-9348-d91e0d485bf2'; // O2M reverse on Company

// ─── salesNote → Opportunity ─────────────────────────────────────────────────
export const SALES_NOTE_TO_OPPORTUNITY_FIELD_UID =
  '7dca18f8-6060-4e5d-92d1-b575fcb05da7'; // M2O on salesNote
export const OPPORTUNITY_TO_SALES_NOTES_FIELD_UID =
  '132243f6-7d72-4a69-a7e1-cfbe77339af9'; // O2M reverse on Opportunity

// ─── salesNote → WorkspaceMember (owner / sales rep) ─────────────────────────
export const SALES_NOTE_TO_OWNER_FIELD_UID =
  '68035e58-9b77-4311-a268-59d2b207beaf'; // M2O on salesNote
export const OWNER_TO_SALES_NOTES_FIELD_UID =
  '3c8c3739-6f8f-4da1-8ed7-34cd38111e84'; // O2M reverse on WorkspaceMember

// ─── Page layout ─────────────────────────────────────────────────────────────
export const SALES_NOTE_PAGE_LAYOUT_UID =
  '70431fc6-23b4-472c-a45e-57ccb2765ca9';
export const SALES_NOTE_TAB_NOTES_UID =
  'fcb2506b-1aef-4658-8dd4-e90fe6586e55';
export const SALES_NOTE_TAB_SUMMARY_UID =
  '7b5080bb-c86e-4cf1-95e3-2d4105ac22c9';
export const SALES_NOTE_TAB_TASKS_UID =
  'c5d78078-1e01-443b-8fc0-b84772727506';
export const SALES_NOTE_TAB_FILES_UID =
  '619dd077-c28b-4a14-b2f9-0343b3bfbd40';

// v0.2.4 — first tab "Details" with a FIELDS widget so the relation/select
// fields (owner, status, company, opportunity, attendees) are visible on
// the salesNote detail page without needing the side panel. Pattern copied
// from upstream resend-email page-layout (Home tab + VERTICAL_LIST mode).
export const SALES_NOTE_TAB_DETAILS_UID =
  '2b3c4d5e-6f70-4819-9a2b-3c4d5e6f7081';
export const SALES_NOTE_DETAILS_FIELDS_WIDGET_UID =
  '3c4d5e6f-7081-492a-9b3c-4d5e6f708192';

// v0.2.5 — replaced the single FIELDS multi-widget with five explicit FIELD
// widgets. The FIELDS widget without a backing FIELDS_WIDGET-type view
// (which the SDK didn't create for us at install time) was rendering only
// a subset of fields AND triggering "Failed to save layout customization"
// when the user tried to add fields manually. Five individual widgets in a
// VERTICAL_LIST tab is deterministic and avoids both issues.
export const SALES_NOTE_DETAILS_OWNER_WIDGET_UID =
  '4d5e6f70-8192-43ab-9c4d-5e6f70819203';
export const SALES_NOTE_DETAILS_STATUS_WIDGET_UID =
  '5e6f7081-92a3-44bc-9d5e-6f70819203a4';
export const SALES_NOTE_DETAILS_COMPANY_WIDGET_UID =
  '6f708192-a3b4-45cd-9e6f-70819203a4b5';
export const SALES_NOTE_DETAILS_OPPORTUNITY_WIDGET_UID =
  '70819203-a4b5-46de-9f70-819203a4b5c6';
export const SALES_NOTE_DETAILS_ATTENDEES_WIDGET_UID =
  '819203a4-b5c6-47ef-a081-9203a4b5c6d7';

// v0.2.7 — custom front-component for the Attendees field. Twenty's standard
// FIELD widget for an O2M-junction relation only knows how to *create a new
// junction record*, not "pick an existing Person to link as an attendee".
// This component renders linked Persons as removable chips with a real
// Person picker for adding more (search by name/email, click to link).
export const ATTENDEES_EDITOR_FRONT_COMPONENT_UID =
  '92a3b4c5-d6e7-48f0-9192-a3b4c5d6e7f8';

// Widgets within tabs
export const SALES_NOTE_NOTES_WIDGET_UID =
  '78af1c01-672d-4c2c-a87d-77dc22d4e26f';
export const SALES_NOTE_SUMMARY_WIDGET_UID =
  '1bba3f20-ca9d-4496-bc5b-0e19926a8d7d';
export const SALES_NOTE_TASKS_WIDGET_UID =
  'e297fab7-13bb-4836-ab61-3580de4c4509';
export const SALES_NOTE_EXTRACT_TASKS_WIDGET_UID =
  'a032f3c8-054e-4714-8378-9997de31cb01';
export const SALES_NOTE_FILES_WIDGET_UID =
  '2c130dd6-6afb-4a5e-9c15-1bc98d072354';

// ─── Front components ────────────────────────────────────────────────────────
export const SALES_NOTE_SUMMARY_VIEWER_UID =
  'b17b0bd7-ec27-4e32-87f7-a193ba7a6c43';
export const EXTRACT_TASKS_PANEL_UID =
  'aaae6614-503e-47f6-b93d-de20c3058645';

// ─── Skill ───────────────────────────────────────────────────────────────────
export const SALES_NOTE_SUMMARIZATION_SKILL_UID =
  '69aa9c07-e93f-4bdc-b9e4-18404af23ed9';

// ─── Logic functions ─────────────────────────────────────────────────────────
// v0.1.7 — auto-default `owner` to the creating user. Listens for
// salesNote.created, reads workspaceMemberId off the event payload, and
// patches `ownerId` if the rep didn't pick one themselves.
export const ON_SALES_NOTE_CREATED_LOGIC_FUNCTION_UID =
  '4b0c7a2f-1d8e-4d7c-9c1f-31a7e2b4d8a5';

// v0.3.0 — inbound HTTP webhook from Voicenotes. POST to
// /s/webhook/voicenotes/:userToken creates a salesNote from the recording
// payload, updates it on `creation.summary`, and patches it on
// `recording.updated`. Handler body lands in Phase D once the probe captures
// the real payload shape; Phase C wires the route only.
export const VOICENOTES_WEBHOOK_LOGIC_FUNCTION_UID =
  'a9521bf0-8ccf-4f33-bd86-a3e67c2e053d';

// ─── Front-components: "+ Sales note" buttons on standard records ───────────
// v0.1.9 — pinned actions on Person / Company / Opportunity record detail
// pages. Each creates a blank salesNote with the source record pre-linked
// (Person → as an attendee via salesNoteAttendee junction; Company →
// companyId; Opportunity → opportunityId), then navigates to the new note so
// the rep can fill in the body. Owner is auto-set by the
// on-sales-note-created logic function (because the GraphQL mutation runs
// as the clicking user, so salesNote.created fires with their
// workspaceMemberId).
export const NEW_SALES_NOTE_FROM_PERSON_FRONT_COMPONENT_UID =
  '7e1f4d2c-9b8a-4f6d-a3c5-2e0b8c7d1f43';
export const NEW_SALES_NOTE_FROM_PERSON_COMMAND_UID =
  'c9d8e7f6-1a2b-4c3d-9e8f-7a6b5c4d3e2f';
export const NEW_SALES_NOTE_FROM_COMPANY_FRONT_COMPONENT_UID =
  '6a8d7e5b-2c4f-4a1d-b8e6-9d3c0f7a2b5e';
export const NEW_SALES_NOTE_FROM_COMPANY_COMMAND_UID =
  'b3a4d5c6-7e8f-49a0-91b2-c3d4e5f60718';
export const NEW_SALES_NOTE_FROM_OPPORTUNITY_FRONT_COMPONENT_UID =
  '5d4c3b2a-1f0e-4d9c-8b7a-6e5d4c3b2a1f';
export const NEW_SALES_NOTE_FROM_OPPORTUNITY_COMMAND_UID =
  'a1b2c3d4-e5f6-4708-9091-a2b3c4d5e6f7';

// ─── Standard object UUIDs (queried from UAT core."objectMetadata" 2026-04-27) ─
export const PERSON_OBJECT_UID = '20202020-e674-48e5-a542-72570eee7213';
export const COMPANY_OBJECT_UID = '20202020-b374-4779-a561-80086cb2e17f';
export const OPPORTUNITY_OBJECT_UID = '20202020-9549-49dd-b2b2-883999db8938';
export const WORKSPACE_MEMBER_OBJECT_UID =
  '20202020-3319-4234-a34c-82d5c0e881a6';
export const TASK_OBJECT_UID = '20202020-1ba1-48ba-bc83-ef7e5990ed10';

// ─── Standard default page-layout UUIDs (well-known constants in upstream) ───
export const DEFAULT_PERSON_LAYOUT_UID =
  '20202020-a102-4002-8002-ae0a1ea11002';
export const DEFAULT_COMPANY_LAYOUT_UID =
  '20202020-a101-4001-8001-c0aba11c0001';
export const DEFAULT_OPPORTUNITY_LAYOUT_UID =
  '20202020-a103-4003-8003-0aa0b1ca1003';

// ─── v0.2.0 — Sales-notes tabs on Person / Company / Opportunity defaults ────
// Tab + widget UIDs. Widget content was placeholder STANDALONE_RICH_TEXT in
// 0.2.0–0.2.1; v0.2.2 swaps in real FRONT_COMPONENT list widgets that fetch
// and render the related salesNotes.
export const SALES_NOTES_ON_PERSON_TAB_UID =
  '8f3e2a1b-9c4d-4e5f-9a07-1b2c3d4e5f60';
export const SALES_NOTES_ON_PERSON_WIDGET_UID =
  '8f3e2a1b-9c4d-4e5f-9a07-1b2c3d4e5f61';
export const SALES_NOTES_ON_COMPANY_TAB_UID =
  '8f3e2a1b-9c4d-4e5f-9a07-1b2c3d4e5f62';
export const SALES_NOTES_ON_COMPANY_WIDGET_UID =
  '8f3e2a1b-9c4d-4e5f-9a07-1b2c3d4e5f63';
export const SALES_NOTES_ON_OPPORTUNITY_TAB_UID =
  '8f3e2a1b-9c4d-4e5f-9a07-1b2c3d4e5f64';
export const SALES_NOTES_ON_OPPORTUNITY_WIDGET_UID =
  '8f3e2a1b-9c4d-4e5f-9a07-1b2c3d4e5f65';

// ─── v0.2.2 — Front-components rendering the per-record filtered list ────────
// Each tab now embeds one of these; they fetch the salesNotes related to the
// focal record (via salesNoteAttendee for Person, via companyId/opportunityId
// for the others) and render a clickable list. Headers/styling kept inline
// (Linaria/emotion break in the sandbox — lesson #6).
export const SALES_NOTES_LIST_ON_PERSON_FRONT_COMPONENT_UID =
  '4d8e9c1f-3a2b-4d5e-8f60-7c8b9a0d1e2f';
export const SALES_NOTES_LIST_ON_COMPANY_FRONT_COMPONENT_UID =
  '5e9d0c2f-4b3c-4e6f-9071-8d9c0b1e2f30';
export const SALES_NOTES_LIST_ON_OPPORTUNITY_FRONT_COMPONENT_UID =
  '6f0e1d3a-5c4d-4f70-a182-9e0d1c2f3041';
