import { Logger } from '@nestjs/common';

import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type FilesFieldDeletionJobData = {
  workspaceId: string;
  fileIds: string[];
  // A rich text body can reference files it does not own: only those the destroyed record owns are deleted.
  recordOwnedFileCandidates?: { fileId: string; recordId: string }[];
};

@Processor(MessageQueue.deleteCascadeQueue)
export class FilesFieldDeletionJob {
  private readonly logger = new Logger(FilesFieldDeletionJob.name);

  constructor(private readonly filesFieldService: FilesFieldService) {}

  @Process(FilesFieldDeletionJob.name)
  async handle(data: FilesFieldDeletionJobData): Promise<void> {
    const { workspaceId } = data;

    const fileIds = [
      ...(data.fileIds ?? []),
      ...(await this.filesFieldService.findFileIdsOwnedByRecords({
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
}
