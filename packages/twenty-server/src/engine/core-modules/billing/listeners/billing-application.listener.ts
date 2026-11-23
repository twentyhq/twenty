/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { APPLICATION_INSTALLATION_CHANGED_EVENT } from 'src/engine/core-modules/application/constants/application-installation-changed.constant';
import { type ApplicationInstallationChangedEvent } from 'src/engine/core-modules/application/types/application-installation-changed.type';
import { UPDATE_SUBSCRIPTION_QUANTITY_JOB_RETRY_OPTIONS } from 'src/engine/core-modules/billing/constants/update-subscription-quantity-job-retry-options.constant';
import {
  SyncSubscriptionApplicationsJob,
  type SyncSubscriptionApplicationsJobData,
} from 'src/engine/core-modules/billing/jobs/sync-subscription-applications.job';
import { BillingApplicationProductService } from 'src/engine/core-modules/billing/services/billing-application-product.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { CONNECTED_ACCOUNT_CONNECTION_CHANGED_EVENT } from 'src/engine/metadata-modules/connected-account/constants/connected-account-connection-changed.constant';
import { CONNECTED_ACCOUNT_DELETED_EVENT } from 'src/engine/metadata-modules/connected-account/constants/connected-account-deleted.constant';
import { type ConnectedAccountConnectionChangedEvent } from 'src/engine/metadata-modules/connected-account/types/connected-account-connection-changed.type';
import { type ConnectedAccountDeletedEvent } from 'src/engine/metadata-modules/connected-account/types/connected-account-deleted.type';
import { OnCustomBatchEvent } from 'src/engine/workspace-event-emitter/decorators/on-custom-batch-event.decorator';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';

@Injectable()
export class BillingApplicationListener {
  constructor(
    @InjectMessageQueue(MessageQueue.billingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingApplicationProductService: BillingApplicationProductService,
  ) {}

  @OnCustomBatchEvent(APPLICATION_INSTALLATION_CHANGED_EVENT)
  async handleApplicationInstallationChanged({
    workspaceId,
  }: CustomWorkspaceEventBatch<ApplicationInstallationChangedEvent>): Promise<void> {
    await this.enqueueApplicationsSync({ workspaceId });
  }

  @OnCustomBatchEvent(CONNECTED_ACCOUNT_CONNECTION_CHANGED_EVENT)
  @OnCustomBatchEvent(CONNECTED_ACCOUNT_DELETED_EVENT)
  async handleConnectedAccountCountChange({
    workspaceId,
    events,
  }: CustomWorkspaceEventBatch<
    ConnectedAccountConnectionChangedEvent | ConnectedAccountDeletedEvent
  >): Promise<void> {
    if (!events.some(({ applicationId }) => isDefined(applicationId))) {
      return;
    }

    await this.enqueueApplicationsSync({ workspaceId });
  }

  private async enqueueApplicationsSync({
    workspaceId,
  }: {
    workspaceId: string | undefined;
  }): Promise<void> {
    if (
      !isDefined(workspaceId) ||
      !this.twentyConfigService.get('IS_BILLING_ENABLED') ||
      !(await this.billingApplicationProductService.isApplicationPriceBillingEnabled(
        workspaceId,
      ))
    ) {
      return;
    }

    await this.messageQueueService.add<SyncSubscriptionApplicationsJobData>(
      SyncSubscriptionApplicationsJob.name,
      { workspaceId },
      {
        ...UPDATE_SUBSCRIPTION_QUANTITY_JOB_RETRY_OPTIONS,
        workspaceId,
        isWorkspaceJob: true,
      },
    );
  }
}
