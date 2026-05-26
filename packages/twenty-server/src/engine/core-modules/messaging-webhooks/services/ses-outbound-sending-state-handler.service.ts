import { Injectable, Logger } from '@nestjs/common';

import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { EmailingDomainTenantStatusService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain-tenant-status.service';
import { type SesEventBridgeNotification } from 'src/engine/core-modules/messaging-webhooks/types/ses-event-bridge-notification.type';
import { parseWorkspaceIdFromAwsSesResourceArn } from 'src/engine/core-modules/messaging-webhooks/utils/parse-workspace-id-from-aws-ses-resource-arn.util';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

@Injectable()
export class SesOutboundSendingStateHandlerService {
  private readonly logger = new Logger(
    SesOutboundSendingStateHandlerService.name,
  );

  constructor(
    private readonly emailingDomainTenantStatusService: EmailingDomainTenantStatusService,
  ) {}

  async handle(event: SesEventBridgeNotification): Promise<void> {
    const targetStatus =
      event['detail-type'] === 'Sending Status Enabled'
        ? EmailingDomainTenantStatus.ACTIVE
        : EmailingDomainTenantStatus.PAUSED;

    const workspaceId = this.resolveWorkspaceIdFromResources(event.resources);

    if (!isDefined(workspaceId)) {
      this.logger.warn(
        `Could not resolve workspaceId from SES sending-state event resources: ${JSON.stringify(event.resources)}`,
      );

      return;
    }

    await this.emailingDomainTenantStatusService.setTenantStatusForWorkspace(
      workspaceId,
      targetStatus,
    );
  }

  private resolveWorkspaceIdFromResources(
    resources: string[] | undefined,
  ): string | null {
    if (!isNonEmptyArray(resources)) {
      return null;
    }

    for (const resourceArn of resources) {
      const workspaceId = parseWorkspaceIdFromAwsSesResourceArn(resourceArn);

      if (isDefined(workspaceId)) {
        return workspaceId;
      }
    }

    return null;
  }
}
