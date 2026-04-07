import { Injectable, Logger } from '@nestjs/common';

import { EmailComposerService } from 'src/engine/core-modules/tool/tools/email-tool/email-composer.service';
import { EmailToolInputZodSchema } from 'src/engine/core-modules/tool/tools/email-tool/email-tool.schema';
import { EmailToolException } from 'src/engine/core-modules/tool/tools/email-tool/exceptions/email-tool.exception';
import { isInsufficientPermissionsError } from 'src/engine/core-modules/tool/tools/email-tool/utils/is-insufficient-permissions-error.util';
import { type EmailToolInput } from 'src/engine/core-modules/tool/tools/email-tool/types/email-tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { SendEmailService } from 'src/modules/messaging/message-outbound-manager/services/send-email.service';

@Injectable()
export class SendEmailTool implements Tool {
  private readonly logger = new Logger(SendEmailTool.name);

  description =
    'Send an email using a connected account. Requires SEND_EMAIL_TOOL permission.';
  inputSchema = EmailToolInputZodSchema;

  constructor(
    private readonly emailComposerService: EmailComposerService,
    private readonly sendEmailService: SendEmailService,
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

      const sendResult = await this.sendEmailService.sendComposedEmail(data);

      await this.sendEmailService.persistSentMessage(
        sendResult,
        data,
        context.workspaceId,
      );

      this.logger.log(
        `Email sent successfully to ${data.toRecipientsDisplay}${data.attachments.length > 0 ? ` with ${data.attachments.length} attachments` : ''}`,
      );

      return {
        success: true,
        message: `Email sent successfully to ${data.toRecipientsDisplay}`,
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
          message: 'Failed to send email',
          error: error.message,
        };
      }

      this.logger.error(`Failed to send email: ${error}`);

      if (isInsufficientPermissionsError(error)) {
        return {
          success: false,
          message: 'Failed to send email due to insufficient permissions',
          error:
            'The connected email account does not have permission to send emails. ' +
            'The user should disconnect and reconnect their account in Settings > Accounts to grant the required permissions.',
        };
      }

      return {
        success: false,
        message: 'Failed to send email',
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }
}
