/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { APPLICATION_INSTALLATION_CHANGED_EVENT } from 'src/engine/core-modules/application/constants/application-installation-changed.constant';
import { type ApplicationInstallationChangedEvent } from 'src/engine/core-modules/application/types/application-installation-changed.type';
import { BillingApplicationSyncService } from 'src/engine/core-modules/billing/services/billing-application-sync.service';
import { CONNECTED_ACCOUNT_CONNECTION_CHANGED_EVENT } from 'src/engine/metadata-modules/connected-account/constants/connected-account-connection-changed.constant';
import { CONNECTED_ACCOUNT_DELETED_EVENT } from 'src/engine/metadata-modules/connected-account/constants/connected-account-deleted.constant';
import { type ConnectedAccountConnectionChangedEvent } from 'src/engine/metadata-modules/connected-account/types/connected-account-connection-changed.type';
import { type ConnectedAccountDeletedEvent } from 'src/engine/metadata-modules/connected-account/types/connected-account-deleted.type';
import { OnCustomBatchEvent } from 'src/engine/workspace-event-emitter/decorators/on-custom-batch-event.decorator';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';

@Injectable()
export class BillingApplicationListener {
  constructor(
    private readonly billingApplicationSyncService: BillingApplicationSyncService,
  ) {}

  @OnCustomBatchEvent(APPLICATION_INSTALLATION_CHANGED_EVENT)
  async handleApplicationInstallationChanged({
    workspaceId,
  }: CustomWorkspaceEventBatch<ApplicationInstallationChangedEvent>): Promise<void> {
    if (!isDefined(workspaceId)) {
      return;
    }

    await this.billingApplicationSyncService.enqueueApplicationsSync({
      workspaceId,
    });
  }

  @OnCustomBatchEvent(CONNECTED_ACCOUNT_CONNECTION_CHANGED_EVENT)
  @OnCustomBatchEvent(CONNECTED_ACCOUNT_DELETED_EVENT)
  async handleConnectedAccountCountChange({
    workspaceId,
    events,
  }: CustomWorkspaceEventBatch<
    ConnectedAccountConnectionChangedEvent | ConnectedAccountDeletedEvent
  >): Promise<void> {
    if (
      !isDefined(workspaceId) ||
      !events.some(({ applicationId }) => isDefined(applicationId))
    ) {
      return;
    }

    await this.billingApplicationSyncService.enqueueApplicationsSync({
      workspaceId,
    });
  }
}
