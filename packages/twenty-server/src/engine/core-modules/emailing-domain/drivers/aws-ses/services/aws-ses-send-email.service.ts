import { Injectable, Logger } from '@nestjs/common';

import { SendBulkEmailCommand, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type EmailingDomainSendEmailBatchInput } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-batch-input.type';
import { type EmailingDomainSendEmailBatchResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-batch-result.type';
import { type EmailingDomainSendEmailInput } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-input.type';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';

import { AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { AwsSesHandleErrorService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-handle-error.service';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';

const SES_BULK_MAX_DESTINATIONS = 50;

type SendEmailContext = {
  tenantName: string;
  configurationSetName: string;
};

@Injectable()
export class AwsSesSendEmailService {
  private readonly logger = new Logger(AwsSesSendEmailService.name);

  constructor(
    private readonly awsSesClientProvider: AwsSesClientProvider,
    private readonly awsSesHandleErrorService: AwsSesHandleErrorService,
  ) {}

  async sendEmail(
    input: EmailingDomainSendEmailInput,
    context: SendEmailContext,
  ): Promise<EmailingDomainSendEmailResult> {
    if (!isNonEmptyArray(input.to)) {
      throw new EmailingDomainDriverException(
        'sendEmail requires at least one recipient',
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    try {
      const sesClient = this.awsSesClientProvider.getSESClient();

      const response = await sesClient.send(
        new SendEmailCommand({
          FromEmailAddress: input.from,
          Destination: {
            ToAddresses: input.to,
            CcAddresses: input.cc,
            BccAddresses: input.bcc,
          },
          ReplyToAddresses: input.replyTo,
          Content: {
            Simple: {
              Headers: isNonEmptyArray(input.headers)
                ? input.headers.map((header) => ({
                    Name: header.name,
                    Value: header.value,
                  }))
                : undefined,
              Subject: { Data: input.subject, Charset: 'UTF-8' },
              Body: {
                Text: { Data: input.text, Charset: 'UTF-8' },
                Html: isDefined(input.html)
                  ? { Data: input.html, Charset: 'UTF-8' }
                  : undefined,
              },
              Attachments: isNonEmptyArray(input.attachments)
                ? input.attachments.map((attachment) => ({
                    FileName: attachment.filename,
                    RawContent: attachment.content,
                    ContentType: attachment.contentType,
                    ContentDisposition: 'ATTACHMENT',
                  }))
                : undefined,
            },
          },
          ConfigurationSetName: context.configurationSetName,
          TenantName: context.tenantName,
          EmailTags: [
            { Name: 'workspace', Value: input.workspaceId },
            { Name: 'domain', Value: input.domain },
            { Name: 'tenant_id', Value: input.workspaceId },
          ],
        }),
      );

      if (!isDefined(response.MessageId)) {
        throw new EmailingDomainDriverException(
          'SES returned no MessageId',
          EmailingDomainDriverExceptionCode.UNKNOWN,
        );
      }

      this.logger.log(
        `Sent email ${response.MessageId} from ${input.from} (tenant ${context.tenantName})`,
      );

      return {
        messageId: response.MessageId,
        deliveredRecipients: {
          to: input.to,
          cc: input.cc ?? [],
          bcc: input.bcc ?? [],
        },
      };
    } catch (error) {
      if (error instanceof EmailingDomainDriverException) {
        throw error;
      }
      this.awsSesHandleErrorService.handleAwsSesError(error, 'sendEmail');
    }
  }
  async sendEmailBatch(
    input: EmailingDomainSendEmailBatchInput,
    context: SendEmailContext,
  ): Promise<EmailingDomainSendEmailBatchResult> {
    if (!isNonEmptyArray(input.recipients)) {
      throw new EmailingDomainDriverException(
        'sendEmailBatch requires at least one recipient',
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    if (input.recipients.length > SES_BULK_MAX_DESTINATIONS) {
      throw new EmailingDomainDriverException(
        `sendEmailBatch accepts at most ${SES_BULK_MAX_DESTINATIONS} recipients, received ${input.recipients.length}`,
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
                Subject: input.template.subject,
                Text: input.template.text,
                Html: input.template.html,
              },
              TemplateData: '{}',
            },
          },
          BulkEmailEntries: input.recipients.map((recipient) => ({
            Destination: { ToAddresses: [recipient.email] },
            ReplacementEmailContent: {
              ReplacementTemplate: {
                ReplacementTemplateData: JSON.stringify(recipient.replacements),
              },
            },
            ReplacementHeaders: isNonEmptyArray(recipient.headers)
              ? recipient.headers.map((header) => ({
                  Name: header.name,
                  Value: header.value,
                }))
              : undefined,
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

      const results = response.BulkEmailEntryResults ?? [];

      return {
        entries: input.recipients.map((recipient, index) => {
          const result = results[index];

          if (!isDefined(result)) {
            return {
              email: recipient.email,
              messageId: null,
              errorMessage: 'SES returned no result for this destination',
            };
          }

          if (!isDefined(result.MessageId)) {
            return {
              email: recipient.email,
              messageId: null,
              errorMessage:
                result.Error ??
                `SES rejected the destination (${result.Status})`,
            };
          }

          return {
            email: recipient.email,
            messageId: result.MessageId,
            errorMessage: null,
          };
        }),
      };
    } catch (error) {
      if (error instanceof EmailingDomainDriverException) {
        throw error;
      }
      this.awsSesHandleErrorService.handleAwsSesError(error, 'sendEmailBatch');
    }
  }
}
