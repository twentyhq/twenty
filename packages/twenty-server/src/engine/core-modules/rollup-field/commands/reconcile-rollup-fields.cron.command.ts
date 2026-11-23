import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RECONCILE_ROLLUP_FIELDS_CRON_PATTERN } from 'src/engine/core-modules/rollup-field/constants/reconcile-rollup-fields-cron-pattern.constant';
import { ReconcileRollupFieldsCronJob } from 'src/engine/core-modules/rollup-field/crons/reconcile-rollup-fields.cron.job';

@Command({
  name: 'cron:reconcile-rollup-fields',
  description: 'Starts a cron job to recompute rollup fields',
})
export class ReconcileRollupFieldsCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: ReconcileRollupFieldsCronJob.name,
      data: undefined,
      options: { repeat: { pattern: RECONCILE_ROLLUP_FIELDS_CRON_PATTERN } },
    });
  }
}
