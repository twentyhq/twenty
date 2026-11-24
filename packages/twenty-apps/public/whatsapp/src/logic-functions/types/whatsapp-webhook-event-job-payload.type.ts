import { type UnipileWebhookEvent } from 'src/unipile/types/unipile-webhook-event.type';

export type WhatsappWebhookEventJobPayload = UnipileWebhookEvent & {
  rateLimitRetryCount?: number;
};
