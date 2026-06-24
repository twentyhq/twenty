import { ViewType, defineView } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_COMPANY_FIELD_ID } from 'src/fields/partner-company.field';
import { PARTNER_USER_ON_PARTNER_FIELD_ID } from 'src/fields/partner-user-on-partner.field';

const PARTNER_NAME_FIELD_ID = 'a0000001-0000-4000-8000-000000000001';
const PARTNER_VALIDATION_STAGE_FIELD_ID =
  '2ca9856f-f54a-4326-9ff3-668fd7da0b50';
const PARTNER_AVAILABILITY_FIELD_ID = 'a0000004-0000-4000-8000-000000000004';
const PARTNER_REGION_FIELD_ID = '560503de-6330-4c1d-af97-a8dee125f2ad';
const PARTNER_TIER_FIELD_ID = 'd4fa6461-37b6-49ee-9181-dd482e74a70b';
const PARTNER_PROFILE_PICTURE_FILE_FIELD_ID =
  '076b81f2-2398-4ece-a352-d7a6f6a89cae';
const PARTNER_PROFILE_PICTURE_LEGACY_FIELD_ID =
  '40d730e3-2785-45c8-aa5f-cc724b1b08e0';
const PARTNER_INTRODUCTION_FIELD_ID = 'a0000009-0000-4000-8000-000000000009';
const PARTNER_SCOPE_FIELD_ID = '500021ad-ca42-4fd3-8727-392dd26b722a';
const PARTNER_SKILLS_FIELD_ID = '6f260cc0-a860-41e6-ad40-a2ef32ecffbe';
const PARTNER_DEPLOYMENT_EXPERTISE_FIELD_ID =
  'a0000005-0000-4000-8000-000000000005';
const PARTNER_LANGUAGES_SPOKEN_FIELD_ID =
  'a0000007-0000-4000-8000-000000000007';
const PARTNER_TYPE_OF_TEAM_FIELD_ID = 'a451e557-a488-470a-8b35-6f9b8cfb1a10';
const PARTNER_COUNTRY_FIELD_ID = 'a77d7fa6-c398-47db-af0f-036a5c719f20';
const PARTNER_CITY_FIELD_ID = '0a1ce916-4df5-469a-b793-30f19e45b38d';
const PARTNER_HOURLY_RATE_FIELD_ID = '6a095709-7620-495f-b6e0-790743e412d5';
const PARTNER_PROJECT_BUDGET_MIN_FIELD_ID =
  '243e9808-c070-4163-8603-ded12b03923c';
const PARTNER_LINKEDIN_FIELD_ID = '640bbf33-45d7-4174-a862-dbe611ab8d1a';
const PARTNER_WEBSITE_FIELD_ID = '111eb60a-6e5b-4d0f-ac0d-31e7e0ddff97';
const PARTNER_CALENDAR_LINK_FIELD_ID = 'a0000008-0000-4000-8000-000000000008';

export const PARTNER_RECORD_PAGE_FIELDS_VIEW_ID =
  'a10bf4de-0770-4bee-ae04-1ae97aa18254';

// FIELDS_WIDGET view backing the Partner record page side panel. Relation fields
// (partnerUser, company) only render in the fields widget when an explicit view
// marks them visible — this is that view. Validation Stage and Partner Tier stay
// listed for admins but are read-locked for the Partner role (see partner.role.ts),
// so partners don't see them on My Profile.
export default defineView({
  universalIdentifier: PARTNER_RECORD_PAGE_FIELDS_VIEW_ID,
  name: 'Partner Record Page Fields',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.FIELDS_WIDGET,
  fields: [
    {
      universalIdentifier: '1077c424-bbb4-44cd-afec-7170d961574e',
      fieldMetadataUniversalIdentifier: PARTNER_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: 'c473b085-a043-48e3-8f30-2936667ae93b',
      fieldMetadataUniversalIdentifier: PARTNER_PROFILE_PICTURE_FILE_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '94bc6866-9a59-442d-9766-e0433420d61a',
      fieldMetadataUniversalIdentifier: PARTNER_PROFILE_PICTURE_LEGACY_FIELD_ID,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: 'e82ab8fa-8d78-4ef4-97f6-5456c9df30b4',
      fieldMetadataUniversalIdentifier: PARTNER_INTRODUCTION_FIELD_ID,
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: 'd61ac88b-139a-417d-8767-1db77a44d1a5',
      fieldMetadataUniversalIdentifier: PARTNER_AVAILABILITY_FIELD_ID,
      position: 4,
      isVisible: true,
    },
    {
      universalIdentifier: '2304f4b9-4faf-4813-8ef7-fb7697d64a92',
      fieldMetadataUniversalIdentifier: PARTNER_SCOPE_FIELD_ID,
      position: 5,
      isVisible: true,
    },
    {
      universalIdentifier: 'a0c47e12-6435-458a-b608-621bcee57474',
      fieldMetadataUniversalIdentifier: PARTNER_SKILLS_FIELD_ID,
      position: 6,
      isVisible: true,
    },
    {
      universalIdentifier: 'cbd9d84c-3d71-495c-b412-08c77f2c124c',
      fieldMetadataUniversalIdentifier: PARTNER_DEPLOYMENT_EXPERTISE_FIELD_ID,
      position: 7,
      isVisible: true,
    },
    {
      universalIdentifier: '42521613-4eeb-4a00-9a25-1d9de793d3c0',
      fieldMetadataUniversalIdentifier: PARTNER_LANGUAGES_SPOKEN_FIELD_ID,
      position: 8,
      isVisible: true,
    },
    {
      universalIdentifier: '2d595d67-8317-4c67-aeec-fe6e030e4830',
      fieldMetadataUniversalIdentifier: PARTNER_TYPE_OF_TEAM_FIELD_ID,
      position: 9,
      isVisible: true,
    },
    {
      universalIdentifier: 'a85dc9bc-a5f5-446e-a36c-492f1b6c0035',
      fieldMetadataUniversalIdentifier: PARTNER_REGION_FIELD_ID,
      position: 10,
      isVisible: true,
    },
    {
      universalIdentifier: '90d11276-1666-4c36-9055-00c4680c3168',
      fieldMetadataUniversalIdentifier: PARTNER_COUNTRY_FIELD_ID,
      position: 11,
      isVisible: true,
    },
    {
      universalIdentifier: '23f76380-3532-4e84-9115-55d395d6646b',
      fieldMetadataUniversalIdentifier: PARTNER_CITY_FIELD_ID,
      position: 12,
      isVisible: true,
    },
    {
      universalIdentifier: 'cf5e9649-a3e9-4b3f-b746-e701e3db7169',
      fieldMetadataUniversalIdentifier: PARTNER_HOURLY_RATE_FIELD_ID,
      position: 13,
      isVisible: true,
    },
    {
      universalIdentifier: '388ae22b-956c-4e5a-8b78-6f8cb0105c1a',
      fieldMetadataUniversalIdentifier: PARTNER_PROJECT_BUDGET_MIN_FIELD_ID,
      position: 14,
      isVisible: true,
    },
    {
      universalIdentifier: '5c8727a3-6e4b-41c7-adf9-530ab6599bf9',
      fieldMetadataUniversalIdentifier: PARTNER_LINKEDIN_FIELD_ID,
      position: 15,
      isVisible: true,
    },
    {
      universalIdentifier: 'a6ef3c3b-103b-41b7-ba85-9d93a9af3296',
      fieldMetadataUniversalIdentifier: PARTNER_WEBSITE_FIELD_ID,
      position: 16,
      isVisible: true,
    },
    {
      universalIdentifier: '4bc68141-963f-4e42-8aa4-c081afc613c7',
      fieldMetadataUniversalIdentifier: PARTNER_CALENDAR_LINK_FIELD_ID,
      position: 17,
      isVisible: true,
    },
    {
      universalIdentifier: '3487e2ae-0feb-41c4-ad0c-f94dff435015',
      fieldMetadataUniversalIdentifier: PARTNER_VALIDATION_STAGE_FIELD_ID,
      position: 18,
      isVisible: true,
    },
    {
      universalIdentifier: '971c79e6-381e-4346-86a4-7119de4824be',
      fieldMetadataUniversalIdentifier: PARTNER_TIER_FIELD_ID,
      position: 19,
      isVisible: true,
    },
    {
      universalIdentifier: 'ec1148d4-01ff-4128-9863-0ac42ea8eb47',
      fieldMetadataUniversalIdentifier: PARTNER_USER_ON_PARTNER_FIELD_ID,
      position: 20,
      isVisible: true,
    },
    {
      universalIdentifier: '3ec293a1-da90-4104-a22e-771c0059e9b5',
      fieldMetadataUniversalIdentifier: PARTNER_COMPANY_FIELD_ID,
      position: 21,
      isVisible: true,
    },
  ],
});
