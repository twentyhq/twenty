/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { UPDATE_SUBSCRIPTION_QUANTITY_JOB_RETRY_OPTIONS } from 'src/engine/core-modules/billing/constants/update-subscription-quantity-job-retry-options.constant';
import { SYNC_SUBSCRIPTION_APPLICATIONS_JOB_NAME } from 'src/engine/core-modules/billing/constants/sync-subscription-applications-job-name.constant';
import { type SyncSubscriptionApplicationsJobData } from 'src/engine/core-modules/billing/jobs/sync-subscription-applications.job';
import { BillingApplicationProductService } from 'src/engine/core-modules/billing/services/billing-application-product.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class BillingApplicationSyncService {
  constructor(
    @InjectMessageQueue(MessageQueue.billingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingApplicationProductService: BillingApplicationProductService,
  ) {}

  async isApplicationBillingActive(workspaceId: string): Promise<boolean> {
    return (
      this.twentyConfigService.get('IS_BILLING_ENABLED') &&
      (await this.billingApplicationProductService.isApplicationPriceBillingEnabled(
        workspaceId,
      ))
    );
  }

  async enqueueApplicationsSync({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    if (!(await this.isApplicationBillingActive(workspaceId))) {
      return;
    }

    await this.messageQueueService.add<SyncSubscriptionApplicationsJobData>(
      SYNC_SUBSCRIPTION_APPLICATIONS_JOB_NAME,
      { workspaceId },
      {
        ...UPDATE_SUBSCRIPTION_QUANTITY_JOB_RETRY_OPTIONS,
        workspaceId,
        isWorkspaceJob: true,
      },
    );
  }
}
