import { ViewFilterOperand, ViewType, defineView } from 'twenty-sdk/define';

import {
  PARTNER_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Partners still in the application stage (not yet validated).
export default defineView({
  universalIdentifier: PARTNER_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Partner applications',
  icon: 'IconUserPlus',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 1,
  fields: [
    { universalIdentifier: 'b4f505d7-3849-4a74-a27f-1c91733702b5', fieldMetadataUniversalIdentifier: 'a0000001-0000-4000-8000-000000000001', position: 0, isVisible: true },
    { universalIdentifier: '8a39e510-e533-4cd7-9b65-5e16b5f773d0', fieldMetadataUniversalIdentifier: '2ca9856f-f54a-4326-9ff3-668fd7da0b50', position: 1, isVisible: true },
    { universalIdentifier: 'b92d7fd4-4a24-4333-89fe-5d726634d428', fieldMetadataUniversalIdentifier: 'd4fa6461-37b6-49ee-9181-dd482e74a70b', position: 2, isVisible: true },
    { universalIdentifier: '2c34a120-b0f8-421b-9546-6483f1202d9f', fieldMetadataUniversalIdentifier: 'a77d7fa6-c398-47db-af0f-036a5c719f20', position: 3, isVisible: true },
  ],
  filters: [
    {
      universalIdentifier: '210deb57-cfca-4086-b9da-ca346fbd3126',
      fieldMetadataUniversalIdentifier: '2ca9856f-f54a-4326-9ff3-668fd7da0b50',
      operand: ViewFilterOperand.IS,
      value: ['APPLICATION'],
    },
  ],
});
