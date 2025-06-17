// packages/twenty-server/src/engine/core-modules/billing/crons/commands/check-inter-payment-expiration.command.ts
import { Command, CommandRunner } from 'nest-commander';

import {
  CHECK_EXPIRED_SUBSCRIPTIONS_CRON_PATTERN,
  CheckExpiredSubscriptionsJob,
} from 'src/engine/core-modules/billing/crons/jobs/billing-check-expired-subscriptions.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:billing:check-inter-payment-expiration',
  description: 'Starts a cron job to check for expired Inter payments',
})
export class CheckInterPaymentExpirationCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: CheckExpiredSubscriptionsJob.name,
      data: undefined,
      options: {
        repeat: { pattern: CHECK_EXPIRED_SUBSCRIPTIONS_CRON_PATTERN },
      },
    });
  }
}
