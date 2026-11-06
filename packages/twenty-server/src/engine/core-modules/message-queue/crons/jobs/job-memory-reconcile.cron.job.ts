import { Logger } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

export const JOB_MEMORY_RECONCILE_CRON_PATTERN = '*/15 * * * *';

@Processor(MessageQueue.cronQueue)
export class JobMemoryReconcileCronJob {
  private readonly logger = new Logger(JobMemoryReconcileCronJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(JobMemoryReconcileCronJob.name)
  @SentryCronMonitor(
    JobMemoryReconcileCronJob.name,
    JOB_MEMORY_RECONCILE_CRON_PATTERN,
  )
  async handle() {
    const cleanedCount =
      await this.messageQueueService.cleanExpiredFinishedJobs();

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned ${cleanedCount} expired finished jobs`);
    }

    const { releasedCount, releasedBytes } =
      await this.messageQueueService.reconcileJobMemory();

    if (releasedCount > 0) {
      this.logger.log(
        `Released ${releasedCount} orphaned job memory charges (${releasedBytes} bytes)`,
      );
    }
  }
}
