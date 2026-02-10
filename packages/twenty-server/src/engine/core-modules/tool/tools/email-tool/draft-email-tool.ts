import { Injectable, Logger } from '@nestjs/common';

import { EmailComposerService } from 'src/engine/core-modules/tool/tools/email-tool/email-composer.service';
import { EmailToolInputZodSchema } from 'src/engine/core-modules/tool/tools/email-tool/email-tool.schema';
import { EmailToolException } from 'src/engine/core-modules/tool/tools/email-tool/exceptions/email-tool.exception';
import { type ComposedEmail } from 'src/engine/core-modules/tool/tools/email-tool/types/composed-email.type';
import { type EmailToolInput } from 'src/engine/core-modules/tool/tools/email-tool/types/email-tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import {
  type Tool,
  type ToolExecutionContext,
} from 'src/engine/core-modules/tool/types/tool.type';
import { MessagingMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/services/messaging-message-outbound.service';

@Injectable()
export class DraftEmailTool implements Tool {
  private readonly logger = new Logger(DraftEmailTool.name);

  description =
    'Create a draft email using a connected account. The email will be saved as a draft, not sent.';
  inputSchema = EmailToolInputZodSchema;

  constructor(
    private readonly emailComposerService: EmailComposerService,
    private readonly messageOutboundService: MessagingMessageOutboundService,
  ) {}

  async execute(
    parameters: EmailToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    try {
      const result = await this.emailComposerService.composeEmail(
        parameters,
        context,
      );

      if (!result.success) {
        return result.output;
      }

      const { data } = result;

      await this.createDraft(data);

      this.logger.log(
        `Draft created successfully for ${data.toRecipientsDisplay}${data.attachments.length > 0 ? ` with ${data.attachments.length} attachments` : ''}`,
      );

      return {
        success: true,
        message: `Draft created successfully for ${data.toRecipientsDisplay}`,
        result: {
          recipients: data.recipients.to,
          ccRecipients: data.recipients.cc,
          bccRecipients: data.recipients.bcc,
          subject: data.sanitizedSubject,
          connectedAccountId: data.connectedAccount.id,
          attachmentCount: data.attachments.length,
        },
      };
    } catch (error) {
      if (error instanceof EmailToolException) {
        return {
          success: false,
          message: 'Failed to create draft',
          error: error.message,
        };
      }

      this.logger.error(`Failed to create draft: ${error}`);

      return {
        success: false,
        message: 'Failed to create draft',
        error:
          error instanceof Error ? error.message : 'Failed to create draft',
      };
    }
  }

  private async createDraft(data: ComposedEmail): Promise<void> {
    await this.messageOutboundService.createDraft(
      {
        to: data.recipients.to,
        cc: data.recipients.cc.length > 0 ? data.recipients.cc : undefined,
        bcc: data.recipients.bcc.length > 0 ? data.recipients.bcc : undefined,
        subject: data.sanitizedSubject,
        body: data.plainTextBody,
        html: data.sanitizedHtmlBody,
        attachments: data.attachments,
      },
      data.connectedAccount,
    );
  }
}
