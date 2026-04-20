import {
  PERSON_ON_RESEND_CONTACT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/constants/universal-identifiers';
import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: RESEND_CONTACTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'resendContacts',
  label: 'Resend Contacts',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    PERSON_ON_RESEND_CONTACT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconAddressBook',
});
