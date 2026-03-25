import { UnrecoverableError } from 'bullmq';
import { extractFolderPathFilenameAndTypeOrThrow } from 'twenty-shared/utils';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type FileDeletionJobData = {
  workspaceId: string;
  fullPath: string;
};

@Processor(MessageQueue.deleteCascadeQueue)
export class FileDeletionJob {
  constructor(private readonly fileService: FileService) {}

  @Process(FileDeletionJob.name)
  async handle(data: FileDeletionJobData): Promise<void> {
    const { workspaceId, fullPath } = data;

    const { folderPath, filename } =
      extractFolderPathFilenameAndTypeOrThrow(fullPath);

    if (!filename) {
      throw new UnrecoverableError(
        `[${FileDeletionJob.name}] Cannot parse filename from full path - ${fullPath}`,
      );
    }

    try {
      await this.fileService.deleteFile({
        workspaceId,
        filename,
        folderPath,
      });
    } catch {
      throw new Error(
        `[${FileDeletionJob.name}] Cannot delete file - ${fullPath}`,
      );
    }
  }
}
