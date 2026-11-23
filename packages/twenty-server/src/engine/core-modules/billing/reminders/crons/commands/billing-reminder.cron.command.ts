import { Command, CommandRunner } from 'nest-commander';

import { BILLING_REMINDER_CRON_PATTERN } from 'src/engine/core-modules/billing/reminders/constants/billing-reminder.cron-pattern.constant';
import { BillingReminderCronJob } from 'src/engine/core-modules/billing/reminders/crons/billing-reminder.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:billing:reminder',
  description:
    'Starts a cron job to send trial-ending and subscription-renewal reminder emails',
})
export class BillingReminderCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: BillingReminderCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: BILLING_REMINDER_CRON_PATTERN },
      },
    });
  }
}
