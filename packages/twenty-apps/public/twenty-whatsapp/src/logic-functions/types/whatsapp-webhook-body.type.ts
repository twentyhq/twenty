import { type WhatsappWebhookValue } from 'src/logic-functions/types/whatsapp-webhook-value.type';

export type WhatsappWebhookBody = {
  object?: string;
  entry?: {
    changes?: {
      field?: string;
      value?: WhatsappWebhookValue;
    }[];
  }[];
};
