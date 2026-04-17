import { RESEND_EMAILS_ON_PERSON_ID } from 'src/modules/resend/fields/resend-emails-on-person.field';
import { RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-email';
import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';

export const PERSON_ON_RESEND_EMAIL_ID =
  'cb08e862-8114-480e-986b-8f50fe49de41';

export default defineField({
  universalIdentifier: PERSON_ON_RESEND_EMAIL_ID,
  objectUniversalIdentifier: RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'person',
  label: 'Person',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: RESEND_EMAILS_ON_PERSON_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'personId',
  },
  icon: 'IconUser',
});
