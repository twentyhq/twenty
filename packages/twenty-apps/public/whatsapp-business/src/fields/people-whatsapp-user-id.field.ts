import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { WHATSAPP_USER_ID_PEOPLE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: WHATSAPP_USER_ID_PEOPLE_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'whatsAppUserId',
  label: 'WhatsApp user ID',
  description: 'Business-scoped user ID from WhatsApp, also set for users who hide their phone number',
  type: FieldType.TEXT,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  isNullable: true,
  isUnique: true,
});
