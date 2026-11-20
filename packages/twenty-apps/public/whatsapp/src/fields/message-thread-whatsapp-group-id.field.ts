import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from "twenty-sdk/define";
import { WHATSAPP_GROUP_ID_MESSAGE_THREAD_FIELD_UNIVERSAL_IDENTIFIER } from "src/constants/universal-identifiers";

export default defineField({
  universalIdentifier: WHATSAPP_GROUP_ID_MESSAGE_THREAD_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'whatsAppGroupId',
  label: 'WhatsApp group ID',
  description: 'Group ID from WhatsApp',
  type: FieldType.TEXT,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageThread.universalIdentifier,
  isNullable: true,
});
