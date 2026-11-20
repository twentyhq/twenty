import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { WHATSAPP_ID_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER } from "src/constants/universal-identifiers";

export default defineField({
  universalIdentifier: WHATSAPP_ID_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'whatsAppId',
  label: 'WhatsApp ID',
  description: 'Message ID from WhatsApp',
  type: FieldType.TEXT,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.message.universalIdentifier,
  isNullable: true,
  isUnique: true,
});
