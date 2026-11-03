import { Injectable } from '@nestjs/common';

import { type ModelMessage } from 'ai';
import { type RunAgentMessage } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { In, Like } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { type ResolvedRunAgentAttachment } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-run-agent-attachment.type';
import { buildRunAgentModelMessageOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-run-agent-model-message.util';
import { extractRunAgentAttachmentFileIdsOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/extract-run-agent-attachment-file-ids.util';
import { DirectMessageFileAccessService } from 'src/engine/permissions/direct-message/services/direct-message-file-access.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class RunAgentAttachmentService {
  constructor(
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly fileUrlService: FileUrlService,
    private readonly directMessageFileAccessService: DirectMessageFileAccessService,
  ) {}

  async buildModelMessagesOrThrow({
    messages,
    workspaceId,
    modalities,
    authContext,
  }: {
    messages: RunAgentMessage[];
    workspaceId: string;
    modalities: string[] | undefined;
    authContext: WorkspaceAuthContext;
  }): Promise<ModelMessage[]> {
    const fileIds = extractRunAgentAttachmentFileIdsOrThrow(messages);

    const attachmentsByFileId = isNonEmptyArray(fileIds)
      ? await this.resolveAttachments({ fileIds, workspaceId, authContext })
      : new Map<string, ResolvedRunAgentAttachment>();

    return messages.map((message) =>
      buildRunAgentModelMessageOrThrow({
        message,
        attachmentsByFileId,
        modalities,
      }),
    );
  }

  private async resolveAttachments({
    fileIds,
    workspaceId,
    authContext,
  }: {
    fileIds: string[];
    workspaceId: string;
    authContext: WorkspaceAuthContext;
  }): Promise<Map<string, ResolvedRunAgentAttachment>> {
    const files = await this.fileRepository.find(workspaceId, {
      where: {
        id: In(fileIds),
        path: Like(`${FileFolder.AgentChat}/%`),
        status: FILE_STATUS.UPLOADED,
      },
    });

    const readableFileIds =
      await this.directMessageFileAccessService.findReadableFileIds({
        workspaceId,
        fileIds: files.map(({ id }) => id),
        authContext,
      });

    const resolvedEntries = await Promise.all(
      files
        .filter((file) => readableFileIds.has(file.id))
        .map(async (file): Promise<[string, ResolvedRunAgentAttachment]> => [
          file.id,
          {
            mediaType: file.mimeType,
            url: await this.fileUrlService.signFileByIdUrl({
              fileId: file.id,
              workspaceId,
              fileFolder: FileFolder.AgentChat,
            }),
          },
        ]),
    );

    return new Map(resolvedEntries);
  }
}
