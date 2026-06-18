import { ViewFilterOperand, ViewType, defineView } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const PARTNER_COUNTRY_FIELD_ID = 'a77d7fa6-c398-47db-af0f-036a5c719f20';
const PARTNER_INTRODUCTION_FIELD_ID = 'a0000009-0000-4000-8000-000000000009';
const PARTNER_VALIDATION_STAGE_FIELD_ID =
  '2ca9856f-f54a-4326-9ff3-668fd7da0b50';
const PARTNER_CREATED_AT_FIELD_ID = '421cbcea-4608-534b-9a3e-0454bdb3123a';

export const PARTNER_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER =
  '8d8fc77b-77df-4eeb-9e0c-6409efd30a9c';

// Naming: partner onboarding applicants — distinct from the Application object's "Applications" view.
export default defineView({
  universalIdentifier: PARTNER_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Partner Applications',
  icon: 'IconInbox',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 2,
  fields: [
    {
      universalIdentifier: 'cc7286fd-b37a-467a-a21a-47140f910137',
      fieldMetadataUniversalIdentifier: 'a0000001-0000-4000-8000-000000000001',
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'c145da29-b040-4070-a726-562460b315c3',
      fieldMetadataUniversalIdentifier: PARTNER_COUNTRY_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '2d198c8a-0199-4b9f-ae07-255172ab6e7e',
      fieldMetadataUniversalIdentifier: PARTNER_INTRODUCTION_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: '835c9a7e-72ec-46c5-8d90-39a02998f561',
      fieldMetadataUniversalIdentifier: PARTNER_CREATED_AT_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 180,
    },
  ],
  filters: [
    {
      universalIdentifier: 'a1ef0bcd-6f2c-44fc-ab3d-11df2523a952',
      fieldMetadataUniversalIdentifier: PARTNER_VALIDATION_STAGE_FIELD_ID,
      operand: ViewFilterOperand.IS,
      value: ['APPLICATION'],
    },
  ],
});
