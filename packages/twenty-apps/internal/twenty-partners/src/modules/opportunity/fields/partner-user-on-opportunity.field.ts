import { FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

export const PARTNER_USER_ON_OPPORTUNITY_FIELD_ID = '7022a40a-a954-4e6b-96b8-1faff0919ec0';
export const OPPORTUNITIES_AS_PARTNER_USER_FIELD_ID = 'b03a26e8-6d9d-4d70-930b-2006929c9869';

export default defineField({
  universalIdentifier: PARTNER_USER_ON_OPPORTUNITY_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'partnerUser',
  label: 'Partner User',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: OPPORTUNITIES_AS_PARTNER_USER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'partnerUserId',
  },
});
