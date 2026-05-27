import { FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

import { PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const PARTNER_CONTENT_CUSTOMER_PERSON_FIELD_ID = 'f17547be-76aa-4231-bd1a-3f57bb1ae323';
export const PARTNER_CONTENTS_ON_PERSON_FIELD_ID = 'fae42f4e-b054-4267-a761-81a6792f7c12';

export default defineField({
  universalIdentifier: PARTNER_CONTENT_CUSTOMER_PERSON_FIELD_ID,
  objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'customerPerson',
  label: 'Customer Person',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PARTNER_CONTENTS_ON_PERSON_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'customerPersonId',
  },
});
