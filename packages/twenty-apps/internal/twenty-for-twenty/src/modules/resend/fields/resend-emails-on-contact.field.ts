import { CONTACT_ON_RESEND_EMAIL_ID } from 'src/modules/resend/fields/contact-on-resend-email.field';
import { RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-contact';
import { RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-email';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export const RESEND_EMAILS_ON_CONTACT_ID =
  'd8b69019-ca10-4599-b099-ecfc891d6438';

export default defineField({
  universalIdentifier: RESEND_EMAILS_ON_CONTACT_ID,
  objectUniversalIdentifier: RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'resendEmails',
  label: 'Emails',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: CONTACT_ON_RESEND_EMAIL_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconMail',
});
