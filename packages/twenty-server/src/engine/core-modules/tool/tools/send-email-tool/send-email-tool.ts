import { Injectable, Logger } from '@nestjs/common';

import { render, toPlainText } from '@react-email/render';
import DOMPurify from 'dompurify';
import { reactMarkupFromJSON } from 'twenty-emails';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { z } from 'zod';

import {
  SendEmailToolException,
  SendEmailToolExceptionCode,
} from 'src/engine/core-modules/tool/tools/send-email-tool/exceptions/send-email-tool.exception';
import { SendEmailToolParametersZodSchema } from 'src/engine/core-modules/tool/tools/send-email-tool/send-email-tool.schema';
import { type SendEmailInput } from 'src/engine/core-modules/tool/tools/send-email-tool/types/send-email-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessagingSendMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-send-message.service';
import { parseEmailBody } from 'src/utils/parse-email-body';

@Injectable()
export class SendEmailTool implements Tool {
  private readonly logger = new Logger(SendEmailTool.name);

  description =
    'Send an email using a connected account. Requires SEND_EMAIL_TOOL permission.';
  inputSchema = SendEmailToolParametersZodSchema;

  constructor(
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly sendMessageService: MessagingSendMessageService,
  ) {}

  private async getConnectedAccount(
    connectedAccountId: string,
    workspaceId: string,
  ) {
    if (!isValidUuid(connectedAccountId)) {
      throw new SendEmailToolException(
        `Connected Account ID is not a valid UUID`,
        SendEmailToolExceptionCode.INVALID_CONNECTED_ACCOUNT_ID,
      );
    }

    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );
    const connectedAccount = await connectedAccountRepository.findOneBy({
      id: connectedAccountId,
    });

    if (!isDefined(connectedAccount)) {
      throw new SendEmailToolException(
        `Connected Account '${connectedAccountId}' not found`,
        SendEmailToolExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND,
      );
    }

    return connectedAccount;
  }

  private async getOrThrowFirstConnectedAccountId(
    workspaceId: string,
  ): Promise<string> {
    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );
    const allAccounts = await connectedAccountRepository.find();

    if (!allAccounts || allAccounts.length === 0) {
      throw new SendEmailToolException(
        'No connected accounts found for this workspace',
        SendEmailToolExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND,
      );
    }

    return allAccounts[0].id;
  }

  async execute(parameters: SendEmailInput): Promise<ToolOutput> {
    const { workspaceId } = this.scopedWorkspaceContextFactory.create();

    const { email, subject, body } = parameters;
    let { connectedAccountId } = parameters;

    try {
      const emailSchema = z
        .string()
        .trim()
        .pipe(z.email({ error: 'Invalid email' }));
      const emailValidation = emailSchema.safeParse(email);

      if (!emailValidation.success) {
        throw new SendEmailToolException(
          `Email '${email}' is invalid`,
          SendEmailToolExceptionCode.INVALID_EMAIL,
        );
      }

      if (!workspaceId) {
        throw new SendEmailToolException(
          'Workspace ID not found',
          SendEmailToolExceptionCode.WORKSPACE_ID_NOT_FOUND,
        );
      }

      if (!connectedAccountId) {
        connectedAccountId =
          await this.getOrThrowFirstConnectedAccountId(workspaceId);
      }

      const connectedAccount = await this.getConnectedAccount(
        connectedAccountId,
        workspaceId,
      );

      const parsedBody = parseEmailBody(body);
      const reactMarkup = reactMarkupFromJSON(parsedBody);
      const htmlBody = await render(reactMarkup);
      const textBody = toPlainText(htmlBody);

      const { JSDOM } = await import('jsdom');
      const window = new JSDOM('').window;
      const purify = DOMPurify(window);
      const safeHtmlBody = purify.sanitize(htmlBody || '');
      const safeSubject = purify.sanitize(subject || '');

      await this.sendMessageService.sendMessage(
        {
          to: email,
          subject: safeSubject,
          body: textBody,
          html: safeHtmlBody,
        },
        connectedAccount,
      );

      this.logger.log(`Email sent successfully to ${email}`);

      return {
        success: true,
        message: `Email sent successfully to ${email}`,
        result: {
          recipient: email,
          subject: safeSubject,
          connectedAccountId,
        },
      };
    } catch (error) {
      if (error instanceof SendEmailToolException) {
        return {
          success: false,
          message: `Failed to send email to ${email}`,
          error: error.message,
        };
      }

      this.logger.error(`Failed to send email: ${error}`);

      return {
        success: false,
        message: `Failed to send email to ${email}`,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }
}
