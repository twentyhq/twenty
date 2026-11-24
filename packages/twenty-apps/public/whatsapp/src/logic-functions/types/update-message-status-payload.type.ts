import { type WhatsAppWebhookMessageStatus } from 'src/logic-functions/types/whatsapp-webhook-message.type';

export type UpdateMessageStatusPayload = {
  whatsAppBusinessAccountId: string;
  displayPhoneNumber: string;
  status: WhatsAppWebhookMessageStatus;
  attempt?: number;
};
