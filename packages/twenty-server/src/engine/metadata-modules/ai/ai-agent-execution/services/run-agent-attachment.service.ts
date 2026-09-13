import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type FilePart, type ModelMessage } from 'ai';
import { type RunAgentMessage } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, Like } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type ResolvedAttachment = {
  mediaType: string;
  url: string;
};

@Injectable()
export class RunAgentAttachmentService {
  constructor(
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async buildModelMessages({
    messages,
    workspaceId,
  }: {
    messages: RunAgentMessage[];
    workspaceId: string;
  }): Promise<ModelMessage[]> {
    const fileIds = this.collectFileIds(messages);

    if (!isNonEmptyArray(fileIds)) {
      return messages.map(toTextModelMessage);
    }

    const attachmentsByFileId = await this.resolveAttachments({
      fileIds,
      workspaceId,
    });

    return messages.map((message) => {
      const fileParts = (message.attachments ?? []).map(
        (attachment): FilePart => {
          const resolved = attachmentsByFileId.get(attachment.fileId);

          if (!isDefined(resolved)) {
            throw new AiException(
              `Attachment ${attachment.fileId} is not an uploaded ${FileFolder.AgentChat} file in this workspace`,
              AiExceptionCode.INVALID_AGENT_INPUT,
            );
          }

          return {
            type: 'file',
            data: resolved.url,
            mediaType: resolved.mediaType,
            filename: attachment.filename,
          };
        },
      );

      if (!isNonEmptyArray(fileParts)) {
        return toTextModelMessage(message);
      }

      return {
        role: 'user',
        content: [
          ...(isNonEmptyString(message.content)
            ? [{ type: 'text' as const, text: message.content }]
            : []),
          ...fileParts,
        ],
      };
    });
  }

  private collectFileIds(messages: RunAgentMessage[]): string[] {
    const messageWithUnsupportedAttachments = messages.find(
      (message) =>
        message.role !== 'user' && isNonEmptyArray(message.attachments),
    );

    if (isDefined(messageWithUnsupportedAttachments)) {
      throw new AiException(
        'Only user messages can carry attachments',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    return [
      ...new Set(
        messages.flatMap((message) =>
          (message.attachments ?? []).map((attachment) => attachment.fileId),
        ),
      ),
    ];
  }

  private async resolveAttachments({
    fileIds,
    workspaceId,
  }: {
    fileIds: string[];
    workspaceId: string;
  }): Promise<Map<string, ResolvedAttachment>> {
    const files = await this.fileRepository.find(workspaceId, {
      where: {
        id: In(fileIds),
        path: Like(`${FileFolder.AgentChat}/%`),
        status: FILE_STATUS.UPLOADED,
      },
    });

    const resolvedEntries = await Promise.all(
      files.map(
        async (file): Promise<[string, ResolvedAttachment]> => [
          file.id,
          {
            mediaType: file.mimeType,
            url: await this.fileUrlService.signFileByIdUrl({
              fileId: file.id,
              workspaceId,
              fileFolder: FileFolder.AgentChat,
            }),
          },
        ],
      ),
    );

    return new Map(resolvedEntries);
  }
}

const toTextModelMessage = (message: RunAgentMessage): ModelMessage => ({
  role: message.role,
  content: message.content,
});
