import { FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

export const PARTNER_USER_ON_COMPANY_FIELD_ID = 'f8f1dbb6-9f9f-4c13-9dab-a19ea6223801';
export const COMPANIES_AS_PARTNER_USER_FIELD_ID = '6235bf5b-9ecf-482f-b8b0-e6ae37659638';

export default defineField({
  universalIdentifier: PARTNER_USER_ON_COMPANY_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'partnerUser',
  label: 'Partner User',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: COMPANIES_AS_PARTNER_USER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'partnerUserId',
  },
});
