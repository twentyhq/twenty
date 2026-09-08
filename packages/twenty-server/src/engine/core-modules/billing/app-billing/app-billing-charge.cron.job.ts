/* @license Enterprise */

import { AppBillingChargeService } from 'src/engine/core-modules/billing/app-billing/app-billing-charge.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.cronQueue)
export class AppBillingChargeCronJob {
  constructor(
    private readonly appBillingChargeService: AppBillingChargeService,
  ) {}

  @Process(AppBillingChargeCronJob.name)
  async handle(): Promise<void> {
    await this.appBillingChargeService.deliverPending();
  }
}
