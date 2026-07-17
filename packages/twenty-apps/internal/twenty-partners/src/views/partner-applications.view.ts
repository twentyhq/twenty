import {
  ViewFilterOperand,
  ViewType,
  defineView,
  getFieldUniversalIdentifier,
} from 'twenty-sdk/define';

import {
  PARTNER_COUNTRY_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_INTRODUCTION_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_VALIDATION_STAGE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/partner-field-universal-identifiers';
import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { PARTNER_USER_ON_PARTNER_FIELD_ID } from 'src/fields/partner-user-on-partner.field';

export const PARTNER_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER =
  '8d8fc77b-77df-4eeb-9e0c-6409efd30a9c';

// createdAt is a reserved system field auto-created on the partner object; the
// server derives its universal identifier deterministically, so resolve it the
// same way rather than hardcoding a value that would drift.
const PARTNER_CREATED_AT_FIELD_ID = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'createdAt',
});

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
      fieldMetadataUniversalIdentifier: PARTNER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'c145da29-b040-4070-a726-562460b315c3',
      fieldMetadataUniversalIdentifier: PARTNER_COUNTRY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '2d198c8a-0199-4b9f-ae07-255172ab6e7e',
      fieldMetadataUniversalIdentifier: PARTNER_INTRODUCTION_FIELD_UNIVERSAL_IDENTIFIER,
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
    {
      universalIdentifier: '0175e169-377c-4ff5-b0f0-c3359cac48d9',
      fieldMetadataUniversalIdentifier: PARTNER_USER_ON_PARTNER_FIELD_ID,
      position: 4,
      isVisible: true,
      size: 200,
    },
  ],
  filters: [
    {
      universalIdentifier: 'a1ef0bcd-6f2c-44fc-ab3d-11df2523a952',
      fieldMetadataUniversalIdentifier: PARTNER_VALIDATION_STAGE_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS,
      value: ['APPLICATION'],
    },
  ],
});
