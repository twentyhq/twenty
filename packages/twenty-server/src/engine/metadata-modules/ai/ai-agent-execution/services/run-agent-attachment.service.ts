import { Injectable } from '@nestjs/common';

import { type ModelMessage } from 'ai';
import { type RunAgentMessage } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { In, Like } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { type ResolvedRunAgentAttachment } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-run-agent-attachment.type';
import { buildRunAgentModelMessageOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-run-agent-model-message.util';
import { extractRunAgentAttachmentFileIdsOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/extract-run-agent-attachment-file-ids.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class RunAgentAttachmentService {
  constructor(
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async buildModelMessagesOrThrow({
    messages,
    workspaceId,
  }: {
    messages: RunAgentMessage[];
    workspaceId: string;
  }): Promise<ModelMessage[]> {
    const fileIds = extractRunAgentAttachmentFileIdsOrThrow(messages);

    const attachmentsByFileId = isNonEmptyArray(fileIds)
      ? await this.resolveAttachments({ fileIds, workspaceId })
      : new Map<string, ResolvedRunAgentAttachment>();

    return messages.map((message) =>
      buildRunAgentModelMessageOrThrow({ message, attachmentsByFileId }),
    );
  }

  private async resolveAttachments({
    fileIds,
    workspaceId,
  }: {
    fileIds: string[];
    workspaceId: string;
  }): Promise<Map<string, ResolvedRunAgentAttachment>> {
    const files = await this.fileRepository.find(workspaceId, {
      where: {
        id: In(fileIds),
        path: Like(`${FileFolder.AgentChat}/%`),
        status: FILE_STATUS.UPLOADED,
      },
    });

    const resolvedEntries = await Promise.all(
      files.map(
        async (file): Promise<[string, ResolvedRunAgentAttachment]> => [
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
