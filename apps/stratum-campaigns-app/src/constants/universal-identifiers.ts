// All universalIdentifier UUIDs for the Stratum Campaigns app live here.
// Generated 2026-05-15. Do NOT change once deployed — these IDs are how the
// server tracks the app's metadata across reinstalls.

// ─── App ─────────────────────────────────────────────────────────────────────
export const APP_DISPLAY_NAME = 'Stratum Campaigns';
export const APP_DESCRIPTION =
  'Surfaces Campaign targets (People + Companies) as dedicated tabs on the Campaign record page, with status visibility, inline editing, and add-by-picker. Campaign + CampaignMember objects themselves live in scripts/stratum/migrations/020-campaigns.py.';
export const APPLICATION_UNIVERSAL_IDENTIFIER =
  '376750d0-5ba8-4900-844b-ec8164923aa2';
export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  '762bf371-85c9-47fa-a26e-9967af65087a';

// ─── Front components ────────────────────────────────────────────────────────
// Two table widgets, one per target type. The SQL migration
// `scripts/stratum/layout-migrations/017-campaign-target-tabs.sql` wires
// these into pageLayoutWidget rows on the campaign default page layout
// (one tab + one widget per component). The widgets render a scrollable
// table of CampaignMember rows filtered to the focal campaign and the
// matching morph variant (targetPerson / targetCompany).

export const CAMPAIGN_PEOPLE_TARGETS_FRONT_COMPONENT_UID =
  '80b9c490-fda9-4b86-88a2-5d6470155ae8';
export const CAMPAIGN_COMPANY_TARGETS_FRONT_COMPONENT_UID =
  '28f06e42-a0a3-48a1-8452-58da452735af';

// ─── Standard object UUIDs (queried from UAT core."objectMetadata" 2026-05-15) ─
// Re-used from sales-notes app constants; these are well-known upstream IDs.
export const PERSON_OBJECT_UID = '20202020-e674-48e5-a542-72570eee7213';
export const COMPANY_OBJECT_UID = '20202020-b374-4779-a561-80086cb2e17f';
