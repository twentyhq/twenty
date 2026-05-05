import { type InboundWebhookEnvelope } from 'src/engine/core-modules/inbound-webhook/types/inbound-webhook-context.type';

export type InboundWebhookJobData = {
  envelope: InboundWebhookEnvelope;
};
