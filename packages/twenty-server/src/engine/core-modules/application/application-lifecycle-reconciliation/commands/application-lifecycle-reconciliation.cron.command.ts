import { Command, CommandRunner } from 'nest-commander';

import { APPLICATION_LIFECYCLE_RECONCILIATION_CRON_PATTERN } from 'src/engine/core-modules/application/application-lifecycle-reconciliation/constants/application-lifecycle-reconciliation.constant';
import { ApplicationLifecycleReconciliationCronJob } from 'src/engine/core-modules/application/application-lifecycle-reconciliation/crons/application-lifecycle-reconciliation.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:application-lifecycle-reconciliation',
  description:
    'Starts a cron job to fail applications left in a transitional state by a worker that never reported back',
})
export class ApplicationLifecycleReconciliationCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: ApplicationLifecycleReconciliationCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: APPLICATION_LIFECYCLE_RECONCILIATION_CRON_PATTERN,
        },
      },
    });
  }
}
