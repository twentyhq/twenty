import { ViewFilterOperand, ViewType, defineView } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_USER_ON_PARTNER_FIELD_ID } from 'src/fields/partner-user-on-partner.field';

const PARTNER_TIER_FIELD_ID = 'd4fa6461-37b6-49ee-9181-dd482e74a70b';
const PARTNER_AVAILABILITY_FIELD_ID = 'a0000004-0000-4000-8000-000000000004';
const PARTNER_REGION_FIELD_ID = '560503de-6330-4c1d-af97-a8dee125f2ad';
const PARTNER_VALIDATION_STAGE_FIELD_ID =
  '2ca9856f-f54a-4326-9ff3-668fd7da0b50';

// Reuses the retired all-partners view id so the 0.5.x→1.0.0 sync updates the Partner
// object's existing view in place instead of deleting it (Twenty blocks deleting an object's only view).
export const PARTNERS_VALIDATED_VIEW_UNIVERSAL_IDENTIFIER =
  '379b11d5-44d5-476b-ba7d-31d5f515c9b4';

export default defineView({
  universalIdentifier: PARTNERS_VALIDATED_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Partners Validated',
  icon: 'IconCircleCheck',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 3,
  fields: [
    {
      // Reuses all-partners' label-identifier viewField id (update in place; its deletion is blocked).
      universalIdentifier: '21afcc69-09c5-42eb-a609-26c062de3bd3',
      fieldMetadataUniversalIdentifier: 'a0000001-0000-4000-8000-000000000001',
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'e41daafb-d157-4730-ae5d-a0305ac12e0e',
      fieldMetadataUniversalIdentifier: PARTNER_TIER_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '60ab0089-7353-4b34-b1d1-747c1e817267',
      fieldMetadataUniversalIdentifier: PARTNER_AVAILABILITY_FIELD_ID,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '0173bc1a-4884-4b58-b12d-77afa1fb1fe1',
      fieldMetadataUniversalIdentifier: PARTNER_REGION_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '866578d7-8a53-4276-bda0-16e657102392',
      fieldMetadataUniversalIdentifier: PARTNER_USER_ON_PARTNER_FIELD_ID,
      position: 4,
      isVisible: true,
      size: 200,
    },
  ],
  filters: [
    {
      universalIdentifier: 'da4ad9b9-57b6-4784-a68b-56426dee3761',
      fieldMetadataUniversalIdentifier: PARTNER_VALIDATION_STAGE_FIELD_ID,
      operand: ViewFilterOperand.IS,
      value: ['VALIDATED'],
    },
  ],
});
