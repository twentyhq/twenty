import { RESEND_CONTACTS_ON_PERSON_ID } from 'src/modules/resend/fields/resend-contacts-on-person.field';
import { RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-contact';
import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';

export const PERSON_ON_RESEND_CONTACT_ID =
  '90353fa9-10fd-4cc8-b7b0-ef9a5d17ff8e';

export default defineField({
  universalIdentifier: PERSON_ON_RESEND_CONTACT_ID,
  objectUniversalIdentifier: RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'person',
  label: 'Person',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    RESEND_CONTACTS_ON_PERSON_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'personId',
  },
  icon: 'IconUser',
});
