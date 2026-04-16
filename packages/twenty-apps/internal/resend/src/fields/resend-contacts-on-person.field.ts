import { PERSON_ON_RESEND_CONTACT_ID } from 'src/fields/person-on-resend-contact.field';
import { RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/resend-contact';
import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';

export const RESEND_CONTACTS_ON_PERSON_ID =
  '134222c5-7760-4fd1-b89d-8a956f3068c5';

export default defineField({
  universalIdentifier: RESEND_CONTACTS_ON_PERSON_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'resendContacts',
  label: 'Resend Contacts',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PERSON_ON_RESEND_CONTACT_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconAddressBook',
});
