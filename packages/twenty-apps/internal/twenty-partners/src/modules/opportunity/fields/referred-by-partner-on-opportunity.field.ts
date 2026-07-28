import { FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const REFERRED_BY_PARTNER_ON_OPPORTUNITY_FIELD_ID = '70fb45ca-8be9-418c-b8f8-ce91da3676d0';
export const REFERRED_OPPORTUNITIES_ON_PARTNER_FIELD_ID = '85bd7d91-c38c-468f-bdb0-60883761ee24';

// Whose public profile page the brief was submitted from — not who works the deal
// (that is `partner`).
export default defineField({
  universalIdentifier: REFERRED_BY_PARTNER_ON_OPPORTUNITY_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'referredByPartner',
  label: 'Referred by',
  icon: 'IconShare',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: REFERRED_OPPORTUNITIES_ON_PARTNER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'referredByPartnerId',
  },
});
