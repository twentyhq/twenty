/* @license Enterprise */

import { Scope } from '@nestjs/common';

import { BillingSubscriptionUpdateService } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { getRecentRenewalDate } from 'src/engine/core-modules/billing/utils/get-recent-renewal-date.util';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
export type UpdateSubscriptionQuantityJobData = {
  workspaceId: string;
  renewalDateMs?: number;
};

@Processor({
  queueName: MessageQueue.billingQueue,
  scope: Scope.REQUEST,
})
export class UpdateSubscriptionQuantityJob {
  constructor(
    private readonly billingSubscriptionUpdateService: BillingSubscriptionUpdateService,
  ) {}

  @Process(UpdateSubscriptionQuantityJob.name)
  async handle({
    workspaceId,
    renewalDateMs,
  }: UpdateSubscriptionQuantityJobData): Promise<void> {
    await this.billingSubscriptionUpdateService.syncSeats({
      workspaceId,
      renewalDate: getRecentRenewalDate({ renewalDateMs, nowMs: Date.now() }),
    });
  }
}
