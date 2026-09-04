/* @license Enterprise */

import { Command, CommandRunner } from 'nest-commander';

import {
  APPLICATION_RECURRING_CHARGE_CRON_PATTERN,
  ApplicationRecurringChargeCronJob,
} from 'src/engine/core-modules/billing/app-billing/crons/jobs/application-recurring-charge.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:billing:application-recurring-charge',
  description: 'Raise declared recurring application charges for the period',
})
export class ApplicationRecurringChargeCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron({
      jobName: ApplicationRecurringChargeCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: APPLICATION_RECURRING_CHARGE_CRON_PATTERN },
      },
    });
  }
}
