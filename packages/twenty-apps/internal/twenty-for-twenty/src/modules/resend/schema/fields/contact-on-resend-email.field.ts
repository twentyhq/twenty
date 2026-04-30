import {
  CONTACT_ON_RESEND_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  RESEND_EMAILS_ON_CONTACT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
} from '@modules/resend/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: CONTACT_ON_RESEND_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'contact',
  label: 'Contact',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    RESEND_EMAILS_ON_CONTACT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'contactId',
  },
  icon: 'IconUser',
});
