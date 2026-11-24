import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ConnectedAccountBillingNotificationService } from 'src/engine/core-modules/application/connected-account-billing-notification/connected-account-billing-notification.service';
import { CONNECTED_ACCOUNT_BILLED_EVENT } from 'src/engine/metadata-modules/connected-account/constants/connected-account-billed.constant';
import { type ConnectedAccountBilledEvent } from 'src/engine/metadata-modules/connected-account/types/connected-account-billed.type';
import { OnCustomBatchEvent } from 'src/engine/workspace-event-emitter/decorators/on-custom-batch-event.decorator';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';

@Injectable()
export class ConnectedAccountBillingNotificationListener {
  constructor(
    private readonly connectedAccountBillingNotificationService: ConnectedAccountBillingNotificationService,
  ) {}

  @OnCustomBatchEvent(CONNECTED_ACCOUNT_BILLED_EVENT)
  async handleConnectedAccountBilled({
    workspaceId,
    events,
  }: CustomWorkspaceEventBatch<ConnectedAccountBilledEvent>): Promise<void> {
    if (!isDefined(workspaceId)) {
      return;
    }

    for (const event of events) {
      await this.connectedAccountBillingNotificationService.notifyBillingMembers(
        { workspaceId, ...event },
      );
    }
  }
}
