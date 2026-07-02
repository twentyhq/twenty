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
  PARTNER_PROFILE_PICTURE_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_PROFILE_PICTURE_LEGACY_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_PROJECT_BUDGET_MIN_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_REGION_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_SCOPE_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_SKILLS_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_TYPE_OF_TEAM_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_WEBSITE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/partner-field-universal-identifiers';
import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const MY_PROFILE_VIEW_UNIVERSAL_IDENTIFIER =
  '183ab293-07ce-4be6-8dfc-436a058c36e9';

// Partner-facing profile view — every Partner field the Partner role may edit (see
// partner.role.ts). Admin-only fields (slug, validation stage, tier, ops notes) stay
// off this view; child collections (links, services, content) are edited from the
// record page side panel relation fields.
export default defineView({
  universalIdentifier: MY_PROFILE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'My Profile',
  icon: 'IconUser',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 2,
  fields: [
    {
      universalIdentifier: 'e23cbd41-dfc1-45d9-b385-e3ddd9d9e909',
      fieldMetadataUniversalIdentifier: PARTNER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'e9267069-69fb-4d88-8f7c-2ce368994333',
      fieldMetadataUniversalIdentifier:
        PARTNER_PROFILE_PICTURE_FILE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '0bd64161-58ca-4fba-8d63-390a430a87bd',
      fieldMetadataUniversalIdentifier:
        PARTNER_PROFILE_PICTURE_LEGACY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '8aa8bca2-8b9d-4028-b003-ab3fe8233fd1',
      fieldMetadataUniversalIdentifier: PARTNER_INTRODUCTION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 360,
    },
    {
      universalIdentifier: 'ce9249d5-914e-458a-a115-e4daa09a6f95',
      fieldMetadataUniversalIdentifier: PARTNER_AVAILABILITY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '57f9309a-d1d3-4a7e-a21e-802c1037b023',
      fieldMetadataUniversalIdentifier: PARTNER_SCOPE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'd8d9b78a-04fc-4bd7-824b-461cc90b66c0',
      fieldMetadataUniversalIdentifier: PARTNER_SKILLS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '1a8c1bd8-9540-40b7-b667-4f6ae59afcac',
      fieldMetadataUniversalIdentifier:
        PARTNER_DEPLOYMENT_EXPERTISE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'fc0272f2-31cb-4c37-85dd-2a70b451185c',
      fieldMetadataUniversalIdentifier:
        PARTNER_LANGUAGES_SPOKEN_FIELD_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '824501d7-b1e0-4cca-bbd5-4880557289d1',
      fieldMetadataUniversalIdentifier: PARTNER_TYPE_OF_TEAM_FIELD_UNIVERSAL_IDENTIFIER,
      position: 9,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'fe4564a9-00b7-40d8-b738-2445a3795ccc',
      fieldMetadataUniversalIdentifier: PARTNER_REGION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 10,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '99be3591-66b0-49dd-b649-fbe2629be4e4',
      fieldMetadataUniversalIdentifier: PARTNER_COUNTRY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 11,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '3cabd110-037f-4ec1-a7a8-e26ae217babb',
      fieldMetadataUniversalIdentifier: PARTNER_CITY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 12,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '0060da9e-8d6a-4056-a931-b506c8b4c122',
      fieldMetadataUniversalIdentifier: PARTNER_HOURLY_RATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 13,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '9523dff9-bb5e-4af6-b24d-2836e4ff38d7',
      fieldMetadataUniversalIdentifier:
        PARTNER_PROJECT_BUDGET_MIN_FIELD_UNIVERSAL_IDENTIFIER,
      position: 14,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '1a77d9c8-56b1-48a0-8de6-59cf721115e8',
      fieldMetadataUniversalIdentifier: PARTNER_LINKEDIN_FIELD_UNIVERSAL_IDENTIFIER,
      position: 15,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '96650eb8-e7bd-4b4a-add2-6b1509a2d2ae',
      fieldMetadataUniversalIdentifier: PARTNER_WEBSITE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 16,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '4349740f-7c1a-4f20-b64f-36d53b18eef1',
      fieldMetadataUniversalIdentifier: PARTNER_CALENDAR_LINK_FIELD_UNIVERSAL_IDENTIFIER,
      position: 17,
      isVisible: true,
      size: 200,
    },
  ],
});
