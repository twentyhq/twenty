import { FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const PARTNER_ON_OPPORTUNITY_FIELD_ID = 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49';
export const OPPORTUNITIES_ON_PARTNER_FIELD_ID = '8c04a5d4-c423-487e-bd78-7142a75b2896';

export default defineField({
  universalIdentifier: PARTNER_ON_OPPORTUNITY_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'partner',
  label: 'Partner',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: OPPORTUNITIES_ON_PARTNER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'partnerId',
  },
});
