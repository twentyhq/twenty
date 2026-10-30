import { Logger } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { SetuAiActionExecutionService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-execution.service';

export type ExecuteSetuAiActionJobData = {
  actionRequestId: string;
};

// Duplicate jobs are harmless: only one of them can claim the queued row.
@Processor(MessageQueue.aiActionQueue)
export class ExecuteSetuAiActionJob {
  private readonly logger = new Logger(ExecuteSetuAiActionJob.name);

  constructor(
    private readonly executionService: SetuAiActionExecutionService,
  ) {}

  @Process(ExecuteSetuAiActionJob.name)
  async handle({ actionRequestId }: ExecuteSetuAiActionJobData): Promise<void> {
    await this.executionService.run({
      actionRequestId,
      leaseOwner: `${ExecuteSetuAiActionJob.name}:${process.pid}:${randomUUID()}`,
    });
  }
}
