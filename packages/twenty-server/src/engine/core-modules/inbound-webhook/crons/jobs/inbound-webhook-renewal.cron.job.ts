import { Logger } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

import { INBOUND_WEBHOOK_RENEWAL_BUFFER_MS } from 'src/engine/core-modules/inbound-webhook/inbound-webhook.constants';
import { InboundWebhookDispatcherService } from 'src/engine/core-modules/inbound-webhook/services/inbound-webhook-dispatcher.service';
import { InboundWebhookSubscriptionService } from 'src/engine/core-modules/inbound-webhook/services/inbound-webhook-subscription.service';

@Processor(MessageQueue.cronQueue)
export class InboundWebhookRenewalCronJob {
  private readonly logger = new Logger(InboundWebhookRenewalCronJob.name);

  constructor(
    private readonly subscriptionService: InboundWebhookSubscriptionService,
    private readonly dispatcher: InboundWebhookDispatcherService,
  ) {}

  @Process(InboundWebhookRenewalCronJob.name)
  async handle(): Promise<void> {
    const threshold = new Date(Date.now() + INBOUND_WEBHOOK_RENEWAL_BUFFER_MS);
    const expiring =
      await this.subscriptionService.findExpiringBefore(threshold);

    for (const subscription of expiring) {
      const handler = this.dispatcher.resolveSubscribable(subscription.source);

      if (handler === null) {
        continue;
      }

      try {
        await handler.renewSubscription(subscription);
      } catch (error) {
        this.logger.error(
          `Failed to renew inbound webhook subscription ${subscription.id}`,
          error instanceof Error ? error.stack : error,
        );
      }
    }
  }
}
