/* @license Enterprise */

import { Scope } from '@nestjs/common';

import { BillingSubscriptionUpdateService } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
export type UpdateSubscriptionQuantityJobData = { workspaceId: string };

@Processor({
  queueName: MessageQueue.billingQueue,
  scope: Scope.REQUEST,
})
export class UpdateSubscriptionQuantityJob {
  constructor(
    private readonly billingSubscriptionUpdateService: BillingSubscriptionUpdateService,
  ) {}

  @Process(UpdateSubscriptionQuantityJob.name)
  async handle(data: UpdateSubscriptionQuantityJobData): Promise<void> {
    await this.billingSubscriptionUpdateService.syncSeats(data.workspaceId);
  }
}
