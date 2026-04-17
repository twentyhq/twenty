import { RESEND_EMAILS_ON_CONTACT_ID } from 'src/modules/resend/fields/resend-emails-on-contact.field';
import { RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-contact';
import { RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-email';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export const CONTACT_ON_RESEND_EMAIL_ID =
  '46ffbf1c-0c25-4995-a209-291626b6fd2d';

export default defineField({
  universalIdentifier: CONTACT_ON_RESEND_EMAIL_ID,
  objectUniversalIdentifier: RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'contact',
  label: 'Contact',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: RESEND_EMAILS_ON_CONTACT_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'contactId',
  },
  icon: 'IconAddressBook',
});
