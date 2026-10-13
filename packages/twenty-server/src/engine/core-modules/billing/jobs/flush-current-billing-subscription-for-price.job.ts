/* @license Enterprise */

import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type FlushCurrentBillingSubscriptionForPriceJobData = {
  stripePriceId: string;
};

@Processor(MessageQueue.billingQueue)
export class FlushCurrentBillingSubscriptionForPriceJob {
  constructor(
    private readonly billingSubscriptionItemService: BillingSubscriptionItemService,
  ) {}

  @Process(FlushCurrentBillingSubscriptionForPriceJob.name)
  async handle({
    stripePriceId,
  }: FlushCurrentBillingSubscriptionForPriceJobData): Promise<void> {
    await this.billingSubscriptionItemService.flushCurrentBillingSubscriptionForPrice(
      stripePriceId,
    );
  }
}
