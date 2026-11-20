import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import {
  WHATSAPP_STATUS_MESSAGE_FIELD_OPTION_UNIVERSAL_IDENTIFIERS,
  WHATSAPP_STATUS_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: WHATSAPP_STATUS_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'whatsAppStatus',
  label: 'WhatsApp status',
  description: 'Delivery status reported by WhatsApp for a message sent by the business',
  type: FieldType.SELECT,
  icon: 'IconChecks',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.message.universalIdentifier,
  isNullable: true,
  options: [
    { id: WHATSAPP_STATUS_MESSAGE_FIELD_OPTION_UNIVERSAL_IDENTIFIERS.sent, value: 'SENT', label: 'Sent', color: 'gray', position: 0 },
    { id: WHATSAPP_STATUS_MESSAGE_FIELD_OPTION_UNIVERSAL_IDENTIFIERS.delivered, value: 'DELIVERED', label: 'Delivered', color: 'blue', position: 1 },
    { id: WHATSAPP_STATUS_MESSAGE_FIELD_OPTION_UNIVERSAL_IDENTIFIERS.read, value: 'READ', label: 'Read', color: 'green', position: 2 },
    { id: WHATSAPP_STATUS_MESSAGE_FIELD_OPTION_UNIVERSAL_IDENTIFIERS.failed, value: 'FAILED', label: 'Failed', color: 'red', position: 3 },
  ],
});
