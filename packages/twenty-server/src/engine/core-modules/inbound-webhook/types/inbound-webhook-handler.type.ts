import {
  type InboundWebhookEnvelope,
  type InboundWebhookRequest,
} from 'src/engine/core-modules/inbound-webhook/types/inbound-webhook-context.type';
import { type InboundWebhookSubscriptionEntity } from 'src/engine/core-modules/inbound-webhook/entities/inbound-webhook-subscription.entity';

// Per-source contract. verify + buildEnvelope run on the API pod (must stay
// fast — only HMAC + lookups). handle runs on the worker pod after the job
// is dequeued and is where heavy work (EML parsing, fetch job dispatch)
// belongs.
export type InboundWebhookHandler = {
  verify(request: InboundWebhookRequest): Promise<boolean>;
  buildEnvelope(
    request: InboundWebhookRequest,
  ): Promise<InboundWebhookEnvelope>;
  handle(envelope: InboundWebhookEnvelope): Promise<void>;
};

// Optional capability for sources backed by an external push subscription
// (Google watch, Microsoft Graph subscriptions). Drives the renewal cron.
export type SubscribableInboundWebhookHandler = InboundWebhookHandler & {
  renewSubscription(
    subscription: InboundWebhookSubscriptionEntity,
  ): Promise<void>;
};

export const isSubscribableInboundWebhookHandler = (
  handler: InboundWebhookHandler,
): handler is SubscribableInboundWebhookHandler =>
  typeof (handler as SubscribableInboundWebhookHandler).renewSubscription ===
  'function';
