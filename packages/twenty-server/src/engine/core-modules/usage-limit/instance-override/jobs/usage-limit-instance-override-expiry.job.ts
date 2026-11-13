/* @license Enterprise */

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';

export type UsageLimitInstanceOverrideExpiryJobData = {
  workspaceId: string;
  usageLimitIds: string[];
};

@Processor(MessageQueue.billingQueue)
export class UsageLimitInstanceOverrideExpiryJob {
  constructor(private readonly usageLimitService: UsageLimitService) {}

  @Process(UsageLimitInstanceOverrideExpiryJob.name)
  async handle({
    workspaceId,
    usageLimitIds,
  }: UsageLimitInstanceOverrideExpiryJobData): Promise<void> {
    await this.usageLimitService.deleteLimits({
      workspaceId,
      usageLimitIds,
    });
  }
}
