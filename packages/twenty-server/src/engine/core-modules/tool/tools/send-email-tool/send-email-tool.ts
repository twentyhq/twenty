import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { render, toPlainText } from '@react-email/render';
import DOMPurify from 'dompurify';
import { reactMarkupFromJSON } from 'twenty-emails';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { In, type Repository } from 'typeorm';
import { z } from 'zod';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { extractFolderPathAndFilename } from 'src/engine/core-modules/file/utils/extract-folderpath-and-filename.utils';
import {
  SendEmailToolException,
  SendEmailToolExceptionCode,
} from 'src/engine/core-modules/tool/tools/send-email-tool/exceptions/send-email-tool.exception';
import { SendEmailInputZodSchema } from 'src/engine/core-modules/tool/tools/send-email-tool/send-email-tool.schema';
import { type SendEmailInput } from 'src/engine/core-modules/tool/tools/send-email-tool/types/send-email-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import {
  type Tool,
  type ToolExecutionContext,
} from 'src/engine/core-modules/tool/types/tool.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessagingSendMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-send-message.service';
import { type MessageAttachment } from 'src/modules/messaging/message-import-manager/types/message';
import { parseEmailBody } from 'src/utils/parse-email-body';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class SendEmailTool implements Tool {
  private readonly logger = new Logger(SendEmailTool.name);

  description =
    'Send an email using a connected account. Requires SEND_EMAIL_TOOL permission.';
  inputSchema = SendEmailInputZodSchema;

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly sendMessageService: MessagingSendMessageService,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly fileService: FileService,
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

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const connectedAccountRepository =
          await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
            workspaceId,
            'connectedAccount',
          );

        const connectedAccount = await connectedAccountRepository.findOne({
          where: { id: connectedAccountId },
          relations: {
            messageChannels: {
              messageFolders: true,
            },
          },
        });

        if (!isDefined(connectedAccount)) {
          throw new SendEmailToolException(
            `Connected Account '${connectedAccountId}' not found`,
            SendEmailToolExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND,
          );
        }

        return connectedAccount;
      },
    );
  }

  private async getOrThrowFirstConnectedAccountId(
    workspaceId: string,
  ): Promise<string> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const connectedAccountRepository =
          await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
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
      },
    );
  }

  private async getAttachments(
    files: Array<{ id: string; name: string; type: string }>,
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
      throw new SendEmailToolException(
        `Files not found: ${filesNotFound.join(', ')}`,
        SendEmailToolExceptionCode.FILE_NOT_FOUND,
      );
    }

    const attachments: MessageAttachment[] = [];

    for (const fileMetadata of files) {
      const fileEntity = fileEntityMap.get(fileMetadata.id)!;

      const { folderPath, filename } = extractFolderPathAndFilename(
        fileEntity.fullPath,
      );

      const stream = await this.fileService.getFileStream(
        folderPath,
        filename,
        workspaceId,
      );

      const buffer = await streamToBuffer(stream);

      attachments.push({
        filename: fileMetadata.name,
        content: buffer,
        contentType: fileMetadata.type,
      });
    }

    return attachments;
  }

  async execute(
    parameters: SendEmailInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const { workspaceId } = context;
    const { email, subject, body, files } = parameters;
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

      if (!connectedAccountId) {
        connectedAccountId =
          await this.getOrThrowFirstConnectedAccountId(workspaceId);
      }

      const connectedAccount = await this.getConnectedAccount(
        connectedAccountId,
        workspaceId,
      );

      const attachments = await this.getAttachments(files || [], workspaceId);

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
          attachments,
        },
        connectedAccount,
      );

      this.logger.log(
        `Email sent successfully to ${email}${attachments.length > 0 ? ` with ${attachments.length} attachments` : ''}`,
      );

      return {
        success: true,
        message: `Email sent successfully to ${email}`,
        result: {
          recipient: email,
          subject: safeSubject,
          connectedAccountId,
          attachmentCount: attachments.length,
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
