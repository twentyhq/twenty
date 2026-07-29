import { Injectable, Logger } from '@nestjs/common';

import { SendBulkEmailCommand } from '@aws-sdk/client-sesv2';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { AwsSesHandleErrorService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-handle-error.service';
import { SES_BULK_EMAIL_MAX_DESTINATIONS } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/ses-bulk-email-max-destinations.constant';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { type EmailingDomainHeader } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-header.type';
import {
  EMAILING_DOMAIN_BULK_RECIPIENT_STATUS,
  type EmailingDomainSendBulkEmailRequest,
  type EmailingDomainSendBulkEmailResult,
} from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-bulk-email.type';

type SendBulkEmailContext = {
  tenantName: string;
  configurationSetName: string;
  htmlTemplate: string;
  textTemplate: string;
  headersByRecipient: Map<string, EmailingDomainHeader[]>;
  variablesByRecipient: Map<string, Record<string, string>>;
};

// SES reports a per-entry status string, and only this one means the message
// was accepted for delivery.
const SES_BULK_ENTRY_SUCCESS_STATUS = 'SUCCESS';

@Injectable()
export class AwsSesSendBulkEmailService {
  private readonly logger = new Logger(AwsSesSendBulkEmailService.name);

  constructor(
    private readonly awsSesClientProvider: AwsSesClientProvider,
    private readonly awsSesHandleErrorService: AwsSesHandleErrorService,
  ) {}

  async sendBulkEmail(
    input: EmailingDomainSendBulkEmailRequest,
    context: SendBulkEmailContext,
  ): Promise<EmailingDomainSendBulkEmailResult> {
    if (!isNonEmptyArray(input.recipients)) {
      throw new EmailingDomainDriverException(
        'sendBulkEmail requires at least one recipient',
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    if (input.recipients.length > SES_BULK_EMAIL_MAX_DESTINATIONS) {
      throw new EmailingDomainDriverException(
        `sendBulkEmail accepts at most ${SES_BULK_EMAIL_MAX_DESTINATIONS} recipients per call`,
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    try {
      const sesClient = this.awsSesClientProvider.getSESClient();

      const response = await sesClient.send(
        new SendBulkEmailCommand({
          FromEmailAddress: input.from,
          ReplyToAddresses: input.replyTo,
          DefaultContent: {
            Template: {
              TemplateContent: {
                Subject: input.subjectTemplate,
                Html: context.htmlTemplate,
                Text: context.textTemplate,
              },
              TemplateData: JSON.stringify({}),
            },
          },
          BulkEmailEntries: input.recipients.map((recipient) => ({
            Destination: { ToAddresses: [recipient.to] },
            ReplacementEmailContent: {
              ReplacementTemplate: {
                ReplacementTemplateData: JSON.stringify({
                  ...recipient.variables,
                  ...(context.variablesByRecipient.get(recipient.to) ?? {}),
                }),
              },
            },
            ReplacementHeaders: (
              context.headersByRecipient.get(recipient.to) ?? []
            ).map((header) => ({ Name: header.name, Value: header.value })),
          })),
          ConfigurationSetName: context.configurationSetName,
          TenantName: context.tenantName,
          DefaultEmailTags: [
            { Name: 'workspace', Value: input.workspaceId },
            { Name: 'domain', Value: input.domain },
            { Name: 'tenant_id', Value: input.workspaceId },
          ],
        }),
      );

      const entryResults = response.BulkEmailEntryResults ?? [];

      this.logger.log(
        `Sent bulk email to ${input.recipients.length} recipients from ${input.from} (tenant ${context.tenantName})`,
      );

      return {
        results: input.recipients.map((recipient, index) => {
          const entryResult = entryResults[index];
          const isSent =
            entryResult?.Status === SES_BULK_ENTRY_SUCCESS_STATUS &&
            isDefined(entryResult.MessageId);

          return {
            to: recipient.to,
            status: isSent
              ? EMAILING_DOMAIN_BULK_RECIPIENT_STATUS.SENT
              : EMAILING_DOMAIN_BULK_RECIPIENT_STATUS.FAILED,
            messageId: entryResult?.MessageId ?? null,
            error: isSent
              ? null
              : (entryResult?.Error ??
                entryResult?.Status ??
                'SES returned no result for this recipient'),
          };
        }),
      };
    } catch (error) {
      if (error instanceof EmailingDomainDriverException) {
        throw error;
      }
      this.awsSesHandleErrorService.handleAwsSesError(error, 'sendBulkEmail');
    }
  }
}
