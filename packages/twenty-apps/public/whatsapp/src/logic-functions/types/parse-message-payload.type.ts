import {
  type WhatsAppWebhookMessageBusinessData,
  type WhatsAppWebhookMessageContacts,
  type WhatsAppWebhookMessageContent,
} from 'src/logic-functions/types/whatsapp-webhook-message.type';

export type ParseMessagePayload = {
  whatsAppBusinessAccountId: string;
  businessData: WhatsAppWebhookMessageBusinessData;
  contacts?: WhatsAppWebhookMessageContacts;
  messages: WhatsAppWebhookMessageContent;
};
