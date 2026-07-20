import { ViewType, defineView } from 'twenty-sdk/define';

import {
  PARTNER_AVAILABILITY_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_CALENDAR_LINK_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_CITY_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_COUNTRY_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_DEPLOYMENT_EXPERTISE_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_HOURLY_RATE_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_INTRODUCTION_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_LANGUAGES_SPOKEN_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_LINKEDIN_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_SLUG_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_PROFILE_PICTURE_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_PROFILE_PICTURE_LEGACY_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_PROJECT_BUDGET_MIN_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_REGION_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_SCOPE_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_SKILLS_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_TIER_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_TYPE_OF_TEAM_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_VALIDATION_STAGE_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_WEBSITE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/partner-field-universal-identifiers';
import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  PARTNER_CONTENTS_ON_PARTNER_FIELD_ID,
} from 'src/fields/partner-content-partner.field';
import { PARTNER_COMPANY_FIELD_ID } from 'src/fields/partner-company.field';
import {
  PARTNER_LINKS_ON_PARTNER_FIELD_ID,
} from 'src/fields/partner-link-partner.field';
import {
  PARTNER_SERVICES_ON_PARTNER_FIELD_ID,
} from 'src/fields/partner-service-partner.field';
import { PARTNER_USER_ON_PARTNER_FIELD_ID } from 'src/fields/partner-user-on-partner.field';

export const PARTNER_RECORD_PAGE_FIELDS_VIEW_ID =
  'a10bf4de-0770-4bee-ae04-1ae97aa18254';

// FIELDS_WIDGET view backing the Partner record page side panel. Relation fields
// (partnerLinks, partnerServices, partnerContents, partnerUser, company) only render
// in the fields widget when an explicit view marks them visible — this is that view.
// Validation Stage and Partner Tier stay listed for admins but are read-locked for
// the Partner role (see partner.role.ts), so partners don't see them on My Profile.
export default defineView({
  universalIdentifier: PARTNER_RECORD_PAGE_FIELDS_VIEW_ID,
  name: 'Partner Record Page Fields',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.FIELDS_WIDGET,
  fields: [
    {
      universalIdentifier: '1077c424-bbb4-44cd-afec-7170d961574e',
      fieldMetadataUniversalIdentifier: PARTNER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: '80a10871-2f16-4aa7-90d5-715052201309',
      fieldMetadataUniversalIdentifier: PARTNER_SLUG_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: 'c473b085-a043-48e3-8f30-2936667ae93b',
      fieldMetadataUniversalIdentifier: PARTNER_PROFILE_PICTURE_FILE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '94bc6866-9a59-442d-9766-e0433420d61a',
      fieldMetadataUniversalIdentifier: PARTNER_PROFILE_PICTURE_LEGACY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: 'e82ab8fa-8d78-4ef4-97f6-5456c9df30b4',
      fieldMetadataUniversalIdentifier: PARTNER_INTRODUCTION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
    },
    {
      universalIdentifier: 'd61ac88b-139a-417d-8767-1db77a44d1a5',
      fieldMetadataUniversalIdentifier: PARTNER_AVAILABILITY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
    },
    {
      universalIdentifier: '2304f4b9-4faf-4813-8ef7-fb7697d64a92',
      fieldMetadataUniversalIdentifier: PARTNER_SCOPE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
    },
    {
      universalIdentifier: 'a0c47e12-6435-458a-b608-621bcee57474',
      fieldMetadataUniversalIdentifier: PARTNER_SKILLS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
    },
    {
      universalIdentifier: 'cbd9d84c-3d71-495c-b412-08c77f2c124c',
      fieldMetadataUniversalIdentifier: PARTNER_DEPLOYMENT_EXPERTISE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 9,
      isVisible: true,
    },
    {
      universalIdentifier: '42521613-4eeb-4a00-9a25-1d9de793d3c0',
      fieldMetadataUniversalIdentifier: PARTNER_LANGUAGES_SPOKEN_FIELD_UNIVERSAL_IDENTIFIER,
      position: 10,
      isVisible: true,
    },
    {
      universalIdentifier: '2d595d67-8317-4c67-aeec-fe6e030e4830',
      fieldMetadataUniversalIdentifier: PARTNER_TYPE_OF_TEAM_FIELD_UNIVERSAL_IDENTIFIER,
      position: 11,
      isVisible: true,
    },
    {
      universalIdentifier: 'a85dc9bc-a5f5-446e-a36c-492f1b6c0035',
      fieldMetadataUniversalIdentifier: PARTNER_REGION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 12,
      isVisible: true,
    },
    {
      universalIdentifier: '90d11276-1666-4c36-9055-00c4680c3168',
      fieldMetadataUniversalIdentifier: PARTNER_COUNTRY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 13,
      isVisible: true,
    },
    {
      universalIdentifier: '23f76380-3532-4e84-9115-55d395d6646b',
      fieldMetadataUniversalIdentifier: PARTNER_CITY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 14,
      isVisible: true,
    },
    {
      universalIdentifier: 'cf5e9649-a3e9-4b3f-b746-e701e3db7169',
      fieldMetadataUniversalIdentifier: PARTNER_HOURLY_RATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 15,
      isVisible: true,
    },
    {
      universalIdentifier: '388ae22b-956c-4e5a-8b78-6f8cb0105c1a',
      fieldMetadataUniversalIdentifier: PARTNER_PROJECT_BUDGET_MIN_FIELD_UNIVERSAL_IDENTIFIER,
      position: 16,
      isVisible: true,
    },
    {
      universalIdentifier: '5c8727a3-6e4b-41c7-adf9-530ab6599bf9',
      fieldMetadataUniversalIdentifier: PARTNER_LINKEDIN_FIELD_UNIVERSAL_IDENTIFIER,
      position: 17,
      isVisible: true,
    },
    {
      universalIdentifier: 'a6ef3c3b-103b-41b7-ba85-9d93a9af3296',
      fieldMetadataUniversalIdentifier: PARTNER_WEBSITE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 18,
      isVisible: true,
    },
    {
      universalIdentifier: '4bc68141-963f-4e42-8aa4-c081afc613c7',
      fieldMetadataUniversalIdentifier: PARTNER_CALENDAR_LINK_FIELD_UNIVERSAL_IDENTIFIER,
      position: 19,
      isVisible: true,
    },
    {
      universalIdentifier: '5b51f559-d78c-48df-9347-7929f87ad8d1',
      fieldMetadataUniversalIdentifier: PARTNER_LINKS_ON_PARTNER_FIELD_ID,
      position: 20,
      isVisible: true,
    },
    {
      universalIdentifier: 'fe7a958a-fc56-4e65-8e37-1925014fb1ae',
      fieldMetadataUniversalIdentifier: PARTNER_SERVICES_ON_PARTNER_FIELD_ID,
      position: 21,
      isVisible: true,
    },
    {
      universalIdentifier: '39b34dc8-7daa-4e30-9183-2ce8f035657a',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENTS_ON_PARTNER_FIELD_ID,
      position: 22,
      isVisible: true,
    },
    {
      universalIdentifier: '3487e2ae-0feb-41c4-ad0c-f94dff435015',
      fieldMetadataUniversalIdentifier: PARTNER_VALIDATION_STAGE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 23,
      isVisible: true,
    },
    {
      universalIdentifier: '971c79e6-381e-4346-86a4-7119de4824be',
      fieldMetadataUniversalIdentifier: PARTNER_TIER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 24,
      isVisible: true,
    },
    {
      universalIdentifier: 'ec1148d4-01ff-4128-9863-0ac42ea8eb47',
      fieldMetadataUniversalIdentifier: PARTNER_USER_ON_PARTNER_FIELD_ID,
      position: 25,
      isVisible: true,
    },
    {
      universalIdentifier: '3ec293a1-da90-4104-a22e-771c0059e9b5',
      fieldMetadataUniversalIdentifier: PARTNER_COMPANY_FIELD_ID,
      position: 26,
      isVisible: true,
    },
  ],
});
