/* @license Enterprise */

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { BILLING_LIMIT_OVERRIDE_EXPIRY_CRON_PATTERN } from 'src/engine/core-modules/billing/limit-override/constants/billing-limit-override-expiry.cron-pattern.constant';
import { BillingLimitOverrideService } from 'src/engine/core-modules/billing/limit-override/services/billing-limit-override.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.cronQueue)
export class BillingLimitOverrideExpiryCronJob {
  constructor(
    private readonly billingLimitOverrideService: BillingLimitOverrideService,
  ) {}

  @Process(BillingLimitOverrideExpiryCronJob.name)
  @SentryCronMonitor(
    BillingLimitOverrideExpiryCronJob.name,
    BILLING_LIMIT_OVERRIDE_EXPIRY_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    await this.billingLimitOverrideService.deleteExpiredLimitOverrideRows();
  }
}
