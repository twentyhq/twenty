export const APP_DISPLAY_NAME = 'Twenty partners';
export const APP_DESCRIPTION = '';
export const APPLICATION_UNIVERSAL_IDENTIFIER = 'e662fc1f-02c1-41ff-b8ba-c95a447b3965';
export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER = 'ee18c3f3-ebe7-4c56-ad6d-aad555cc32db';
export const PARTNER_OBJECT_UNIVERSAL_IDENTIFIER = '39101b39-1c16-4148-9e82-45dc271bb90d';
export const PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER = '65172140-d377-41c1-a2ae-190e96fb79dd';
export const ALL_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER = '379b11d5-44d5-476b-ba7d-31d5f515c9b4';
export const PARTNERS_NAV_UNIVERSAL_IDENTIFIER = '3fe15ab5-e38b-4914-af17-2270b210aeb2';
export const ON_OPP_AUTO_MATCH_FN_UNIVERSAL_IDENTIFIER = 'eb8d4d26-8103-4b66-9026-6a86556f7ca5';
export const POST_INSTALL_FN_UNIVERSAL_IDENTIFIER = 'f92bad2e-5905-4757-96ee-af9869d4ca0c';
export const ON_PARTNER_APPLICATION_CREATED_FN_UNIVERSAL_IDENTIFIER = '43888cce-a2aa-4100-afbc-59a4f978ce53';
export const MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER = 'd8dd0623-3a4c-4ab3-a1e0-4ece7df24fb2';
export const INTRO_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER = 'fcf39b0c-0547-415e-806d-b238131ad7cc';

// Roles (Task 2)
export const TWENTY_PARTNER_OPS_ROLE_UNIVERSAL_IDENTIFIER = '3340ca65-863d-4cdc-95c9-8abdec13d0f6';
export const PARTNER_ROLE_UNIVERSAL_IDENTIFIER = 'c3c1dc2e-1a08-4de5-abb7-2139b3d99343';

// Opportunity pipeline views + nav (simplified to partner presence; UIDs reused
// from the previous matching views so they update in place rather than re-create).
export const OPPORTUNITIES_NO_PARTNER_VIEW_UNIVERSAL_IDENTIFIER = 'fe11e738-6bf3-4714-929c-51c76a3fd050';
// Fresh id (the old matches-overview id '5a8fd51a…' kept its stale KANBAN type +
// view groups on re-sync; a new id forces a clean TABLE recreate).
export const OPPORTUNITIES_WITH_PARTNER_VIEW_UNIVERSAL_IDENTIFIER = '053449b0-3d13-400d-afc2-6182a75b6dff';
export const OPPORTUNITIES_NO_PARTNER_NAV_UNIVERSAL_IDENTIFIER = '00be7449-8927-47c8-a6a1-212d9106587f';
export const OPPORTUNITIES_WITH_PARTNER_NAV_UNIVERSAL_IDENTIFIER = '0cf349c9-fcbf-40f8-8e91-142c02bbde9c';
// Kanban board of with-partner opportunities, grouped by match status.
export const OPPORTUNITIES_WITH_PARTNER_BOARD_VIEW_UNIVERSAL_IDENTIFIER = 'a426c594-513d-4252-808f-3cf26d5532b9';
export const OPPORTUNITIES_WITH_PARTNER_BOARD_NAV_UNIVERSAL_IDENTIFIER = '3226b314-15e5-4182-89fe-b33d341f5684';

// Page layout (Task 6)
export const PARTNER_RECORD_PAGE_UNIVERSAL_IDENTIFIER = 'a888b39e-d64a-48ba-a044-d8cb685fad74';

// All Opportunities view + nav
export const ALL_OPPORTUNITIES_VIEW_UNIVERSAL_IDENTIFIER = '6ce1300b-6e91-4c28-83bb-6f692dbc7a98';
export const ALL_OPPORTUNITIES_NAV_UNIVERSAL_IDENTIFIER = '37944f52-cbe5-4814-a1e6-be5b21425870';

// Partner views + nav (harmonization)
export const PARTNER_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER = 'b57a84ed-d7c1-420d-b0eb-348db0dac612';
export const VALIDATED_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER = '13cca6a7-b9f1-4103-b011-ea2e39430899';
export const PARTNER_CONTENT_VIEW_UNIVERSAL_IDENTIFIER = 'd9db705c-795a-4a14-b891-6201149510b3';
export const PARTNER_APPLICATIONS_NAV_UNIVERSAL_IDENTIFIER = '13e2334a-6b1e-4080-8c74-d11109990cc1';
export const VALIDATED_PARTNERS_NAV_UNIVERSAL_IDENTIFIER = '6aed30c6-d80f-4ac6-aab0-db5bc59e5c4b';
export const PARTNER_CONTENT_NAV_UNIVERSAL_IDENTIFIER = '3543723d-80c1-466a-ac35-86f7b284917b';

// TFT sync — objects
export const PARTNERS_TFT_SYNC_EVENT_OBJECT_UUID = 'c4e2f6a8-1b9d-4c8e-8b5f-2e8c4a6f1d3b';
export const PARTNERS_TFT_SYNC_CURSOR_OBJECT_UUID = 'e7d9b1c4-5a8e-4d7b-8e2f-1c4d7b9e3a6f';

// TFT sync event fields
export const PARTNERS_TFT_SYNC_EVENT_OPP_NAME_FIELD_UUID = 'c7f2a5d8-4b1e-4c7f-9a2d-5e8b1f4c7a2e';
export const PARTNERS_TFT_SYNC_EVENT_DIRECTION_FIELD_UUID = 'd7d5c3f1-6b4e-4d1f-9c8a-5d3f7e2c4b1a';
export const PARTNERS_TFT_SYNC_EVENT_TFT_OPP_ID_FIELD_UUID = 'e2e8b6d4-9c5f-4a3e-8f7c-2b6d4a9e5c3f';
export const PARTNERS_TFT_SYNC_EVENT_PAYLOAD_FIELD_UUID = 'f5c1f9e7-3d8a-4b6c-8f4e-9c7f5b3a1d8e';
export const PARTNERS_TFT_SYNC_EVENT_STATUS_FIELD_UUID = 'a8d4b2f9-6c1a-4c9d-8b5f-4a8d6b2c9f1e';
export const PARTNERS_TFT_SYNC_EVENT_ERROR_FIELD_UUID = 'b1a7e5d3-9f4b-4d2c-8f8a-7d1c3e9f5a4b';
export const PARTNERS_TFT_SYNC_EVENT_ATTEMPT_COUNT_FIELD_UUID = 'c4f2a8c6-1e7b-4e5d-9c3a-1b6e4d8c2f7a';

// TFT sync cursor fields
export const PARTNERS_TFT_SYNC_CURSOR_NAME_FIELD_UUID = 'b5e8a1f4-7d4a-4b5e-9f2a-4d7a5b8e1f4a';
export const PARTNERS_TFT_SYNC_CURSOR_LAST_CURSOR_AT_FIELD_UUID = 'f1e4c7a8-8b3f-4a2e-9f5d-4c7a1b8e5d3c';
export const PARTNERS_TFT_SYNC_CURSOR_LAST_RUN_AT_FIELD_UUID = 'a4f7d2b6-1c9a-4f5c-8b8e-7d4a2c9f1e6b';
export const PARTNERS_TFT_SYNC_CURSOR_STATUS_FIELD_UUID = 'b7a1e5c9-4d8b-4b8f-9e3a-2e7b5d1c8f4a';
export const PARTNERS_TFT_SYNC_CURSOR_LAST_ERROR_FIELD_UUID = 'c2b4f8e1-7a6c-4e1b-8f6d-5c2e8b1d4f7a';

// TFT sync logic functions
export const ON_OPPORTUNITY_SYNCED_LF_UUID = 'd7b5d3f9-4a1c-4f8e-8d6b-4c9f7e5a3d1b';
export const ON_OPPORTUNITY_CHANGED_LF_UUID = 'e9c8a6d2-7b4e-4a1f-8e9c-8d2f6c4b7e3a';
export const RECONCILE_OPPORTUNITIES_LF_UUID = 'f2d1f9b5-8c6e-4b4a-9d7c-3f5b1a8d6c4e';
export const RECONCILE_ECHOES_LF_UUID = 'a8f3c2d6-1b9e-4c7a-9d4f-3e8b2a6c1d5f';

// TFT sync application variables
export const PARTNERS_SYNC_SHARED_SECRET_VAR_UUID = 'a5d3a8f1-4f3d-4d1c-8b6a-9e4c1f7b3d5a';
export const TFT_ECHO_ENDPOINT_VAR_UUID = 'b8f2b9f7-6e5a-4a4d-9c1b-3a7f4d2c8b6e';
export const TFT_API_URL_VAR_UUID = 'c1a9c3e5-9b2f-4b7a-8d4c-5e1a8f3b6d2c';
export const TFT_API_KEY_VAR_UUID = 'd4b6e8d2-3c7a-4c4f-9a7e-8b4d1c5f9b3a';
export const PARTNERS_SYNC_SELF_ENDPOINT_VAR_UUID = 'e5f8a2d1-4c7b-4e5f-8a2d-1c4e7b5f8a2d';
export const PARTNERS_PUBLIC_URL_VAR_UUID = 'f6a9b3e4-5d8c-4f6a-9b3e-2c5d8f6a9b3e';

// TFT sync nav + views
export const PARTNERS_TFT_SYNC_EVENTS_NAV_UUID = 'e2f5c8d1-9b4a-4e2f-9c5a-3d8e2f5b1c9a';
export const PARTNERS_TFT_SYNC_EVENTS_VIEW_UUID = 'f5a2d8e4-3c7b-4f5a-8d2e-6b1f5a8e4d2c';
