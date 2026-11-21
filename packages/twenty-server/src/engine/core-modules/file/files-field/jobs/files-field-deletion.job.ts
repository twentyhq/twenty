import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export type FilesFieldDeletionJobData = {
  workspaceId: string;
  fileIds: string[];
  // A rich text body can reference files it does not own: only those the destroyed record owns are deleted.
  recordOwnedFileCandidates?: { fileId: string; recordId: string }[];
};

@Processor(MessageQueue.deleteCascadeQueue)
export class FilesFieldDeletionJob {
  private readonly logger = new Logger(FilesFieldDeletionJob.name);

  constructor(
    private readonly filesFieldService: FilesFieldService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
  ) {}

  @Process(FilesFieldDeletionJob.name)
  async handle(data: FilesFieldDeletionJobData): Promise<void> {
    const { workspaceId } = data;

    const fileIds = [
      ...(data.fileIds ?? []),
      ...(await this.findRecordOwnedFileIds({
        workspaceId,
        recordOwnedFileCandidates: data.recordOwnedFileCandidates ?? [],
      })),
    ];

    for (const fileId of fileIds) {
      try {
        await this.filesFieldService.deleteFilesFieldFile({
          fileId,
          workspaceId,
        });
      } catch {
        this.logger.log(`Failed to delete file ${fileId}`);
      }
    }
  }

  private async findRecordOwnedFileIds({
    workspaceId,
    recordOwnedFileCandidates,
  }: {
    workspaceId: string;
    recordOwnedFileCandidates: { fileId: string; recordId: string }[];
  }): Promise<string[]> {
    if (recordOwnedFileCandidates.length === 0) {
      return [];
    }

    const candidateFiles = await this.fileRepository.find(workspaceId, {
      where: {
        id: In(recordOwnedFileCandidates.map(({ fileId }) => fileId)),
        recordId: In(recordOwnedFileCandidates.map(({ recordId }) => recordId)),
      },
      select: ['id', 'recordId'],
    });

    const candidateKeys = new Set(
      recordOwnedFileCandidates.map(
        ({ fileId, recordId }) => `${fileId}:${recordId}`,
      ),
    );

    return candidateFiles
      .filter(({ id, recordId }) => candidateKeys.has(`${id}:${recordId}`))
      .map(({ id }) => id);
  }
}
