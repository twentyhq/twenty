import { Injectable } from '@nestjs/common';

import {
  InboundWebhookException,
  InboundWebhookExceptionCode,
} from 'src/engine/core-modules/inbound-webhook/inbound-webhook.exception';
import {
  type InboundWebhookHandler,
  type SubscribableInboundWebhookHandler,
  isSubscribableInboundWebhookHandler,
} from 'src/engine/core-modules/inbound-webhook/types/inbound-webhook-handler.type';
import { type InboundWebhookSource } from 'src/engine/core-modules/inbound-webhook/types/inbound-webhook-source.type';

// Switch dispatcher (mirrors MessagingGetMessageListService and the Stripe
// webhook handler in billing-webhook). Concrete sources are added by each
// consumer PR — driver migration, inbound email, etc. — by injecting their
// handler class and adding a case below.
@Injectable()
export class InboundWebhookDispatcherService {
  resolve(source: InboundWebhookSource): InboundWebhookHandler {
    switch (source) {
      // Per-source handlers registered in follow-up PRs.
      default:
        throw new InboundWebhookException(
          `Inbound webhook source ${source} is not supported`,
          InboundWebhookExceptionCode.SOURCE_NOT_SUPPORTED,
        );
    }
  }

  resolveSubscribable(
    source: InboundWebhookSource,
  ): SubscribableInboundWebhookHandler | null {
    const handler = this.resolve(source);

    return isSubscribableInboundWebhookHandler(handler) ? handler : null;
  }
}
