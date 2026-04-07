import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { render, toPlainText } from '@react-email/render';
import DOMPurify from 'dompurify';
import { reactMarkupFromJSON } from 'twenty-emails';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { WorkflowAttachment } from 'twenty-shared/workflow';
import { In, type Repository } from 'typeorm';
import { z } from 'zod';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import {
  EmailToolException,
  EmailToolExceptionCode,
} from 'src/engine/core-modules/tool/tools/email-tool/exceptions/email-tool.exception';
import { EmailComposerResult } from 'src/engine/core-modules/tool/tools/email-tool/types/email-composer-result.type';
import { EmailToolInput } from 'src/engine/core-modules/tool/tools/email-tool/types/email-tool-input.type';
import { parseCommaSeparatedEmails } from 'src/engine/core-modules/tool/tools/email-tool/utils/parse-comma-separated-emails.util';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessagingAccountAuthenticationService } from 'src/modules/messaging/message-import-manager/services/messaging-account-authentication.service';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { type MessageAttachment } from 'src/modules/messaging/message-import-manager/types/message';
import { parseEmailBody } from 'src/utils/parse-email-body';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
@Injectable()
export class EmailComposerService {
  private readonly logger = new Logger(EmailComposerService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly messagingAccountAuthenticationService: MessagingAccountAuthenticationService,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly fileService: FileService,
  ) {}

  private async getConnectedAccount(
    connectedAccountId: string,
    workspaceId: string,
  ) {
    if (!isValidUuid(connectedAccountId)) {
      throw new EmailToolException(
        `Connected Account ID is not a valid UUID`,
        EmailToolExceptionCode.INVALID_CONNECTED_ACCOUNT_ID,
      );
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const connectedAccount = await this.connectedAccountRepository.findOne({
          where: { id: connectedAccountId, workspaceId },
          relations: {
            messageChannels: {
              messageFolders: true,
            },
          },
        });

        if (!isDefined(connectedAccount)) {
          throw new EmailToolException(
            `Connected Account '${connectedAccountId}' not found`,
            EmailToolExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND,
          );
        }

        return connectedAccount;
      },
      authContext,
    );
  }

  private async getOrThrowFirstConnectedAccountId(
    workspaceId: string,
  ): Promise<string> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const allAccounts = await this.connectedAccountRepository.find({
          where: { workspaceId },
        });

        if (!allAccounts || allAccounts.length === 0) {
          throw new EmailToolException(
            'No connected accounts found for this workspace',
            EmailToolExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND,
          );
        }

        return allAccounts[0].id;
      },
      authContext,
    );
  }

  private normalizeRecipients(parameters: EmailToolInput): {
    to: string[];
    cc: string[];
    bcc: string[];
  } {
    if (
      !parameters.recipients ||
      !parameters.recipients.to ||
      parameters.recipients.to.trim().length === 0
    ) {
      throw new EmailToolException(
        'No recipients specified',
        EmailToolExceptionCode.INVALID_EMAIL,
      );
    }

    const to = parseCommaSeparatedEmails(parameters.recipients.to);

    if (to.length === 0) {
      throw new EmailToolException(
        'No valid recipients specified',
        EmailToolExceptionCode.INVALID_EMAIL,
      );
    }

    return {
      to,
      cc: parseCommaSeparatedEmails(parameters.recipients.cc),
      bcc: parseCommaSeparatedEmails(parameters.recipients.bcc),
    };
  }

  private validateEmails(recipients: {
    to: string[];
    cc: string[];
    bcc: string[];
  }): string[] {
    const emailSchema = z.string().trim().pipe(z.email());
    const invalidEmails: string[] = [];

    const allEmails = [...recipients.to, ...recipients.cc, ...recipients.bcc];

    for (const email of allEmails) {
      const result = emailSchema.safeParse(email);

      if (!result.success) {
        invalidEmails.push(email);
      }
    }

    return invalidEmails;
  }

  private async getAttachments(
    files: Array<WorkflowAttachment>,
    workspaceId: string,
  ): Promise<MessageAttachment[]> {
    if (files.length === 0) {
      return [];
    }

    const fileIds = files.map((file) => file.id);

    const fileEntities = await this.fileRepository.find({
      where: { id: In(fileIds) },
    });

    const fileEntityMap = new Map(
      fileEntities.map((entity) => [entity.id, entity]),
    );

    const filesNotFound: string[] = [];

    for (const fileMetadata of files) {
      if (!fileEntityMap.has(fileMetadata.id)) {
        filesNotFound.push(`${fileMetadata.name} (${fileMetadata.id})`);
      }
    }

    if (filesNotFound.length > 0) {
      throw new EmailToolException(
        `Files not found: ${filesNotFound.join(', ')}`,
        EmailToolExceptionCode.FILE_NOT_FOUND,
      );
    }

    const attachments: MessageAttachment[] = [];

    for (const fileMetadata of files) {
      const { stream } = await this.fileService.getFileStreamById({
        fileId: fileMetadata.id,
        workspaceId,
        fileFolder: FileFolder.Workflow,
      });

      const buffer = await streamToBuffer(stream);

      attachments.push({
        filename: fileMetadata.name,
        content: buffer,
        contentType: fileMetadata.type,
      });
    }

    return attachments;
  }

  // Look up the provider-specific thread ID (e.g. Gmail threadId) from the
  // parent message so replies can be explicitly threaded in the provider API.
  private async getThreadExternalId(
    workspaceId: string,
    inReplyTo: string,
    messageChannelId: string,
  ): Promise<string | undefined> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageWorkspaceEntity>(
            workspaceId,
            'message',
          );

        const parentMessage = await messageRepository.findOne({
          where: { headerMessageId: inReplyTo },
        });

        if (!parentMessage) {
          return undefined;
        }

        const associationRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
            workspaceId,
            'messageChannelMessageAssociation',
          );

        const association = await associationRepository.findOne({
          where: {
            messageId: parentMessage.id,
            messageChannelId,
          },
        });

        return association?.messageThreadExternalId ?? undefined;
      },
      authContext,
    );
  }

  async composeEmail(
    parameters: EmailToolInput,
    context: ToolExecutionContext,
  ): Promise<EmailComposerResult> {
    const { workspaceId } = context;
    const { subject, body, files, inReplyTo } = parameters;
    let { connectedAccountId } = parameters;

    let recipients: { to: string[]; cc: string[]; bcc: string[] };

    try {
      recipients = this.normalizeRecipients(parameters);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid recipients';

      return {
        success: false,
        output: {
          success: false,
          message: errorMessage,
          error: errorMessage,
        },
      };
    }

    const invalidEmails = this.validateEmails(recipients);

    if (invalidEmails.length > 0) {
      return {
        success: false,
        output: {
          success: false,
          message: `Invalid email addresses: ${invalidEmails.join(', ')}`,
          error: `Invalid email addresses: ${invalidEmails.join(', ')}`,
        },
      };
    }

    const toRecipientsDisplay = recipients.to.join(', ');

    if (!connectedAccountId) {
      connectedAccountId =
        await this.getOrThrowFirstConnectedAccountId(workspaceId);
    }

    const connectedAccount = await this.getConnectedAccount(
      connectedAccountId,
      workspaceId,
    );

    const messageChannel = connectedAccount.messageChannels.find(
      (channel) => channel.handle === connectedAccount.handle,
    );

    if (!isDefined(messageChannel)) {
      throw new EmailToolException(
        `No message channel found for connected account '${connectedAccountId}'`,
        EmailToolExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND,
      );
    }

    const connectedAccountAsWorkspaceEntity = connectedAccount;

    const { accessToken, refreshToken } =
      await this.messagingAccountAuthenticationService.validateAndRefreshConnectedAccountAuthentication(
        {
          connectedAccount: connectedAccountAsWorkspaceEntity,
          workspaceId,
          messageChannelId: messageChannel.id,
        },
      );

    const connectedAccountWithFreshTokens = {
      ...connectedAccountAsWorkspaceEntity,
      accessToken,
      refreshToken,
    };

    const attachments = await this.getAttachments(files || [], workspaceId);

    const parsedBody = parseEmailBody(body);
    const reactMarkup = reactMarkupFromJSON(parsedBody);
    const htmlBody = await render(reactMarkup);
    const plainTextBody = toPlainText(htmlBody);

    const { JSDOM } = await import('jsdom');
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);
    const sanitizedHtmlBody = purify.sanitize(htmlBody || '');
    const sanitizedSubject = purify.sanitize(subject || '');

    let threadExternalId: string | undefined;

    if (inReplyTo) {
      threadExternalId = await this.getThreadExternalId(
        workspaceId,
        inReplyTo,
        messageChannel.id,
      );
    }

    return {
      success: true,
      data: {
        recipients,
        toRecipientsDisplay,
        sanitizedSubject,
        plainTextBody,
        sanitizedHtmlBody,
        attachments,
        connectedAccount: connectedAccountWithFreshTokens,
        messageChannelId: messageChannel.id,
        inReplyTo,
        threadExternalId,
      },
    };
  }
}
