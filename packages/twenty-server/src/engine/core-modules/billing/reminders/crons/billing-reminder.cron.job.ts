import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { BILLING_REMINDER_CRON_PATTERN } from 'src/engine/core-modules/billing/reminders/constants/billing-reminder.cron-pattern.constant';
import { BillingReminderService } from 'src/engine/core-modules/billing/reminders/services/billing-reminder.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.cronQueue)
export class BillingReminderCronJob {
  constructor(
    private readonly billingReminderService: BillingReminderService,
  ) {}

  @Process(BillingReminderCronJob.name)
  @SentryCronMonitor(BillingReminderCronJob.name, BILLING_REMINDER_CRON_PATTERN)
  async handle(): Promise<void> {
    await this.billingReminderService.processReminders();
  }
}
