import { FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

import { PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const PARTNER_CONTENT_CUSTOMER_COMPANY_FIELD_ID = 'd448f6be-533f-4c43-a70f-55dc361dcdd7';
export const PARTNER_CONTENTS_ON_COMPANY_FIELD_ID = '941e7707-1b3d-47d4-b13a-45c6628c1b3d';

export default defineField({
  universalIdentifier: PARTNER_CONTENT_CUSTOMER_COMPANY_FIELD_ID,
  objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'customerCompany',
  label: 'Customer Company',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PARTNER_CONTENTS_ON_COMPANY_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'customerCompanyId',
  },
});
