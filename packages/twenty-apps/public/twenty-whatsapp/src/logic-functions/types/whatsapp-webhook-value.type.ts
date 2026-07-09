import { type WhatsappWebhookContact } from 'src/logic-functions/types/whatsapp-webhook-contact.type';
import { type WhatsappWebhookMessage } from 'src/logic-functions/types/whatsapp-webhook-message.type';

export type WhatsappWebhookValue = {
  metadata?: {
    display_phone_number?: string;
    phone_number_id?: string;
  };
  contacts?: WhatsappWebhookContact[];
  messages?: WhatsappWebhookMessage[];
};
