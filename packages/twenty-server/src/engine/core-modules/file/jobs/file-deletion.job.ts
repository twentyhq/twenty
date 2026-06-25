import { FileFolder } from 'twenty-shared/types';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type FileDeletionJobData = {
  workspaceId: string;
  fileId: string;
  fileFolder: FileFolder;
};

@Processor(MessageQueue.deleteCascadeQueue)
export class FileDeletionJob {
  constructor(private readonly fileStorageService: FileStorageService) {}

  @Process(FileDeletionJob.name)
  async handle({
    workspaceId,
    fileId,
    fileFolder,
  }: FileDeletionJobData): Promise<void> {
    try {
      await this.fileStorageService.deleteByFileId({
        fileId,
        workspaceId,
        fileFolder,
      });
    } catch {
      throw new Error(
        `[${FileDeletionJob.name}] Cannot delete file - ${fileId} in folder ${fileFolder}`,
      );
    }
  }
}
