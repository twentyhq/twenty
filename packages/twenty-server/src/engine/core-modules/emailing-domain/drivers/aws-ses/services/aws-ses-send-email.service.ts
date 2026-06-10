import { Injectable, Logger } from '@nestjs/common';

import { SendEmailCommand } from '@aws-sdk/client-sesv2';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  type EmailingDomainSendEmailInput,
  type EmailingDomainSendEmailResult,
} from 'src/engine/core-modules/emailing-domain/drivers/types/send-email';

import { AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { AwsSesHandleErrorService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-handle-error.service';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';

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
}
