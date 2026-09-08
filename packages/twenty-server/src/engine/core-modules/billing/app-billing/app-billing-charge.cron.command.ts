/* @license Enterprise */

import { Command, CommandRunner } from 'nest-commander';

import { AppBillingChargeCronJob } from 'src/engine/core-modules/billing/app-billing/app-billing-charge.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:billing:app-charges',
  description: 'Retries durable application usage deliveries',
})
export class AppBillingChargeCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: AppBillingChargeCronJob.name,
      data: undefined,
      options: { repeat: { pattern: '* * * * *' } },
    });
  }
}
