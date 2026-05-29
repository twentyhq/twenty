import { Injectable, Logger } from '@nestjs/common';

import { FieldActorSource } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { EmailGroupSuppressionService } from 'src/engine/core-modules/emailing-domain/services/email-group-suppression.service';
import { EmailGroupSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-reason.type';
import { type SesEventBridgeNotification } from 'src/engine/core-modules/messaging-webhooks/types/ses-event-bridge-notification.type';
import { resolveWorkspaceIdFromAwsSesResources } from 'src/engine/core-modules/messaging-webhooks/utils/resolve-workspace-id-from-aws-ses-resources.util';

@Injectable()
export class SesOutboundSuppressionHandlerService {
  private readonly logger = new Logger(
    SesOutboundSuppressionHandlerService.name,
  );

  constructor(
    private readonly emailGroupSuppressionService: EmailGroupSuppressionService,
  ) {}

  async handle(event: SesEventBridgeNotification): Promise<void> {
    const suppression = this.resolveSuppression(event);

    if (!isDefined(suppression)) {
      return;
    }

    const workspaceId = resolveWorkspaceIdFromAwsSesResources(event.resources);

    if (!isDefined(workspaceId)) {
      this.logger.warn(
        `Could not resolve workspaceId from SES ${event['detail-type']} event resources: ${JSON.stringify(event.resources)}`,
      );

      return;
    }

    const results = await Promise.allSettled(
      suppression.emailAddresses.map((emailAddress) =>
        this.emailGroupSuppressionService.suppress({
          workspaceId,
          emailAddress,
          reason: suppression.reason,
          createdBySource: FieldActorSource.WEBHOOK,
          providerEventId: suppression.providerEventId,
        }),
      ),
    );

    if (results.some((result) => result.status === 'rejected')) {
      throw new Error(
        `Failed to suppress one or more recipients for ${event['detail-type']} event in workspace ${workspaceId}`,
      );
    }
  }

  private resolveSuppression(event: SesEventBridgeNotification): {
    reason: EmailGroupSuppressionReason;
    emailAddresses: string[];
    providerEventId: string | null;
  } | null {
    if (event['detail-type'] === 'Email Bounced') {
      const bounce = event.detail?.bounce;

      if (bounce?.bounceType !== 'Permanent') {
        return null;
      }

      const emailAddresses = this.extractRecipientAddresses(
        bounce.bouncedRecipients,
      );

      if (!isNonEmptyArray(emailAddresses)) {
        return null;
      }

      return {
        reason: EmailGroupSuppressionReason.HARD_BOUNCE,
        emailAddresses,
        providerEventId: bounce.feedbackId ?? null,
      };
    }

    if (event['detail-type'] === 'Email Complaint Received') {
      const complaint = event.detail?.complaint;
      const emailAddresses = this.extractRecipientAddresses(
        complaint?.complainedRecipients,
      );

      if (!isNonEmptyArray(emailAddresses)) {
        return null;
      }

      return {
        reason: EmailGroupSuppressionReason.COMPLAINT,
        emailAddresses,
        providerEventId: complaint?.feedbackId ?? null,
      };
    }

    return null;
  }

  private extractRecipientAddresses = (
    recipients: { emailAddress: string }[] | undefined,
  ): string[] => {
    return (recipients ?? [])
      .map((recipient) => recipient.emailAddress)
      .filter(isDefined);
  };
}
