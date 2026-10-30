import { Injectable, Logger } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  ExecuteSetuAiActionJob,
  type ExecuteSetuAiActionJobData,
} from 'src/engine/metadata-modules/ai/ai-actions/jobs/execute-setu-ai-action.job';
import { SetuAiActionExecutionService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-execution.service';
import { SetuAiActionLedgerService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-ledger.service';

const DISPATCH_BATCH_SIZE = 100;

// The queued row is the durable intent; Redis only carries a pointer to it.
// This repairs whatever a lost enqueue or a dead worker left behind.
@Injectable()
export class SetuAiActionDispatcherService {
  private readonly logger = new Logger(SetuAiActionDispatcherService.name);

  constructor(
    private readonly ledgerService: SetuAiActionLedgerService,
    private readonly executionService: SetuAiActionExecutionService,
    @InjectMessageQueue(MessageQueue.aiActionQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async enqueue(actionRequestId: string): Promise<void> {
    await this.messageQueueService.add<ExecuteSetuAiActionJobData>(
      ExecuteSetuAiActionJob.name,
      { actionRequestId },
    );
  }

  async dispatch(): Promise<void> {
    const expiredCount = await this.ledgerService.expirePendingReviews();

    for (const action of await this.ledgerService.findRunningWithExpiredLease(
      DISPATCH_BATCH_SIZE,
    )) {
      await this.executionService
        .reconcileAbandonedRun(action)
        .catch((error) =>
          this.logger.error(
            `Could not reconcile action ${action.id}: ${error instanceof Error ? error.name : 'error'}`,
          ),
        );
    }

    const queued =
      await this.ledgerService.findQueuedActionIds(DISPATCH_BATCH_SIZE);

    for (const { id } of queued) {
      await this.enqueue(id);
    }

    if (expiredCount > 0 || queued.length > 0) {
      this.logger.log(
        `Expired ${expiredCount} reviews, enqueued ${queued.length} queued actions`,
      );
    }
  }
}
