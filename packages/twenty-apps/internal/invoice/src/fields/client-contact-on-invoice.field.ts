import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  CLIENT_CONTACT_ON_INVOICE_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICES_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: CLIENT_CONTACT_ON_INVOICE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: INVOICE_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'clientContact',
  label: 'Client contact',
  description: 'The client, when they are an individual rather than a business.',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    INVOICES_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'clientContactId',
  },
});
