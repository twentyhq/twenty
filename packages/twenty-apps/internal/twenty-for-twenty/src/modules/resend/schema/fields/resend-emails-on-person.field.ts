import {
  PERSON_ON_RESEND_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_EMAILS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
} from '@modules/resend/constants/universal-identifiers';
import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: RESEND_EMAILS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'resendEmails',
  label: 'Resend Emails',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    PERSON_ON_RESEND_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconMail',
});
