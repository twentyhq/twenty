import { SEGMENT_ON_RESEND_CONTACT_ID } from 'src/modules/resend/fields/segment-on-resend-contact.field';
import { RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-contact';
import { RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-segment';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export const RESEND_CONTACTS_ON_SEGMENT_ID =
  'ba14727c-19eb-4b08-844c-88bf33b8267d';

export default defineField({
  universalIdentifier: RESEND_CONTACTS_ON_SEGMENT_ID,
  objectUniversalIdentifier: RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'resendContacts',
  label: 'Contacts',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SEGMENT_ON_RESEND_CONTACT_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconAddressBook',
});
