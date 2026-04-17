import { PERSON_ON_RESEND_EMAIL_ID } from 'src/modules/resend/fields/person-on-resend-email.field';
import { RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-email';
import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';

export const RESEND_EMAILS_ON_PERSON_ID =
  'c6142228-e0e4-4143-9942-df4fce3ef231';

export default defineField({
  universalIdentifier: RESEND_EMAILS_ON_PERSON_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'resendEmails',
  label: 'Resend Emails',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PERSON_ON_RESEND_EMAIL_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconMail',
});
