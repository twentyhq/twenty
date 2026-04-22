import {
  RESEND_CONTACTS_ON_SEGMENT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  SEGMENT_ON_RESEND_CONTACT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: RESEND_CONTACTS_ON_SEGMENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'resendContacts',
  label: 'Contacts',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SEGMENT_ON_RESEND_CONTACT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconAddressBook',
});
