/* @license Enterprise */

import { Command, CommandRunner } from 'nest-commander';

import { BILLING_LIMIT_OVERRIDE_EXPIRY_CRON_PATTERN } from 'src/engine/core-modules/billing/limit-override/constants/billing-limit-override-expiry.cron-pattern.constant';
import { BillingLimitOverrideExpiryCronJob } from 'src/engine/core-modules/billing/limit-override/crons/billing-limit-override-expiry.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:billing:limit-override-expiry',
  description:
    'Starts a cron job to remove the usage limits of ended limit override arrangements',
})
export class BillingLimitOverrideExpiryCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: BillingLimitOverrideExpiryCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: BILLING_LIMIT_OVERRIDE_EXPIRY_CRON_PATTERN },
      },
    });
  }
}
