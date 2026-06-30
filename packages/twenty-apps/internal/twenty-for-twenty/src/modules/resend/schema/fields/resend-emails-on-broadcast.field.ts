import {
  BROADCAST_ON_RESEND_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  RESEND_EMAILS_ON_BROADCAST_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
} from '@modules/resend/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: RESEND_EMAILS_ON_BROADCAST_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'resendEmails',
  label: 'Emails',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    BROADCAST_ON_RESEND_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconMail',
});
