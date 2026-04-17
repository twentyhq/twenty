import { BROADCAST_ON_RESEND_EMAIL_ID } from 'src/modules/resend/fields/broadcast-on-resend-email.field';
import { RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-broadcast';
import { RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-email';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export const RESEND_EMAILS_ON_BROADCAST_ID =
  '0b346627-4797-4cff-8a7c-1dc8f4580d6f';

export default defineField({
  universalIdentifier: RESEND_EMAILS_ON_BROADCAST_ID,
  objectUniversalIdentifier: RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'resendEmails',
  label: 'Emails',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    BROADCAST_ON_RESEND_EMAIL_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconMail',
});
