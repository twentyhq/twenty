import { Injectable, Logger } from '@nestjs/common';

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { z } from 'zod';

import {
  SendEmailToolException,
  SendEmailToolExceptionCode,
} from 'src/engine/core-modules/tool/tools/send-email-tool/exceptions/send-email-tool.exception';
import { SendEmailToolParametersZodSchema } from 'src/engine/core-modules/tool/tools/send-email-tool/send-email-tool.schema';
import { SendEmailInput } from 'src/engine/core-modules/tool/tools/send-email-tool/types/send-email-input.type';
import { ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessagingSendMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-send-message.service';

@Injectable()
export class SendEmailTool implements Tool {
  private readonly logger = new Logger(SendEmailTool.name);

  description =
    'Send an email using a connected account. Requires SEND_EMAIL_TOOL permission.';
  parameters = SendEmailToolParametersZodSchema;

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
      const emailSchema = z.string().trim().email('Invalid email');
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

      const window = new JSDOM('').window;
      const purify = DOMPurify(window);
      const safeBody = purify.sanitize(body || '');
      const safeSubject = purify.sanitize(subject || '');

      await this.sendMessageService.sendMessage(
        {
          to: email,
          subject: safeSubject,
          body: safeBody,
        },
        connectedAccount,
      );

      this.logger.log(`Email sent successfully to ${email}`);

      return {
        result: {
          success: true,
          message: `Email sent successfully to ${email}`,
        },
      };
    } catch (error) {
      if (error instanceof SendEmailToolException) {
        return {
          error: error.message,
        };
      }

      this.logger.error(`Failed to send email: ${error}`);

      return {
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }
}
