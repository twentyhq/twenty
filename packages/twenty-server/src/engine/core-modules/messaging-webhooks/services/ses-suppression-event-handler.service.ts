import { Injectable, Logger } from '@nestjs/common';

import { FieldActorSource } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { AWS_SES_WORKSPACE_TAG_NAME } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-workspace-tag-name.constant';
import { EmailGroupSuppressionService } from 'src/engine/core-modules/emailing-domain/services/email-group-suppression.service';
import { EmailGroupSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-reason.type';
import { type SesEventBridgeNotification } from 'src/engine/core-modules/messaging-webhooks/types/ses-event-bridge-notification.type';
import { parseWorkspaceIdFromAwsSesResourceArn } from 'src/engine/core-modules/messaging-webhooks/utils/parse-workspace-id-from-aws-ses-resource-arn.util';

@Injectable()
export class SesSuppressionEventHandlerService {
  private readonly logger = new Logger(SesSuppressionEventHandlerService.name);

  constructor(
    private readonly emailGroupSuppressionService: EmailGroupSuppressionService,
  ) {}

  async handle(event: SesEventBridgeNotification): Promise<void> {
    const suppression = this.resolveSuppression(event);

    if (!isDefined(suppression)) {
      return;
    }

    const workspaceId = this.resolveWorkspaceId(event);

    if (!isDefined(workspaceId)) {
      this.logger.warn(
        `Could not resolve workspaceId for SES ${event['detail-type']} event`,
      );

      return;
    }

    for (const emailAddress of suppression.emailAddresses) {
      await this.emailGroupSuppressionService.suppress(
        workspaceId,
        emailAddress,
        suppression.reason,
        FieldActorSource.WEBHOOK,
        suppression.feedbackId,
      );
    }
  }

  private resolveSuppression(event: SesEventBridgeNotification): {
    reason: EmailGroupSuppressionReason;
    emailAddresses: string[];
    feedbackId: string | null;
  } | null {
    if (event['detail-type'] === 'Email Bounced') {
      const bounce = event.detail?.bounce;

      if (bounce?.bounceType !== 'Permanent') {
        return null;
      }

      return {
        reason: EmailGroupSuppressionReason.HARD_BOUNCE,
        emailAddresses: extractEmailAddresses(bounce.bouncedRecipients),
        feedbackId: bounce.feedbackId ?? null,
      };
    }

    if (event['detail-type'] === 'Email Complaint Received') {
      const complaint = event.detail?.complaint;

      return {
        reason: EmailGroupSuppressionReason.COMPLAINT,
        emailAddresses: extractEmailAddresses(complaint?.complainedRecipients),
        feedbackId: complaint?.feedbackId ?? null,
      };
    }

    return null;
  }

  private resolveWorkspaceId(event: SesEventBridgeNotification): string | null {
    const taggedWorkspaceId =
      event.detail?.mail?.tags?.[AWS_SES_WORKSPACE_TAG_NAME]?.[0];

    if (isDefined(taggedWorkspaceId) && taggedWorkspaceId.length > 0) {
      return taggedWorkspaceId;
    }

    if (!isNonEmptyArray(event.resources)) {
      return null;
    }

    for (const resourceArn of event.resources) {
      const workspaceId = parseWorkspaceIdFromAwsSesResourceArn(resourceArn);

      if (isDefined(workspaceId)) {
        return workspaceId;
      }
    }

    return null;
  }
}

const extractEmailAddresses = (
  recipients: { emailAddress: string }[] | undefined,
): string[] =>
  isNonEmptyArray(recipients)
    ? recipients.map((recipient) => recipient.emailAddress)
    : [];
