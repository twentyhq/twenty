/* @license Enterprise */

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';

export type BillingLimitOverrideExpiryJobData = {
  workspaceId: string;
  usageLimitIds: string[];
};

@Processor(MessageQueue.billingQueue)
export class BillingLimitOverrideExpiryJob {
  constructor(private readonly usageLimitService: UsageLimitService) {}

  @Process(BillingLimitOverrideExpiryJob.name)
  async handle({
    workspaceId,
    usageLimitIds,
  }: BillingLimitOverrideExpiryJobData): Promise<void> {
    for (const usageLimitId of usageLimitIds) {
      await this.usageLimitService.delete({
        workspaceId,
        usageLimitId,
        isOperator: true,
      });
    }
  }
}
