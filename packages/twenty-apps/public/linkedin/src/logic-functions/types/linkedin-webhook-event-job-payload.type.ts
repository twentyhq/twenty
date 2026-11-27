import { type UnipileWebhookEvent } from 'src/unipile/types/unipile-webhook-event.type';

export type LinkedinWebhookEventJobPayload = UnipileWebhookEvent & {
  rateLimitRetryCount?: number;
};
