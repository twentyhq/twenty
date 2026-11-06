import { Command, CommandRunner } from 'nest-commander';

import {
  JOB_MEMORY_RECONCILE_CRON_PATTERN,
  JobMemoryReconcileCronJob,
} from 'src/engine/core-modules/message-queue/crons/jobs/job-memory-reconcile.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:job-memory:reconcile',
  description:
    'Releases job memory charges whose job left the queue without a release',
})
export class JobMemoryReconcileCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron({
      jobName: JobMemoryReconcileCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: JOB_MEMORY_RECONCILE_CRON_PATTERN,
        },
      },
    });
  }
}
