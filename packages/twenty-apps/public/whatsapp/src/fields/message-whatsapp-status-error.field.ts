import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { WHATSAPP_STATUS_ERROR_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: WHATSAPP_STATUS_ERROR_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'whatsAppStatusError',
  label: 'WhatsApp delivery error',
  description: 'Why WhatsApp could not deliver the message, when its status is Failed',
  type: FieldType.TEXT,
  icon: 'IconAlertTriangle',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.message.universalIdentifier,
  isNullable: true,
});
