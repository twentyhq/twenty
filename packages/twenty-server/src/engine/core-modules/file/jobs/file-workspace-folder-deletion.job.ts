import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type FileWorkspaceFolderDeletionJobData = {
  workspaceId: string;
};

@Processor(MessageQueue.workspaceQueue)
export class FileWorkspaceFolderDeletionJob {
  constructor(private readonly fileService: FileService) {}

  @Process(FileWorkspaceFolderDeletionJob.name)
  async handle(data: FileWorkspaceFolderDeletionJobData): Promise<void> {
    const { workspaceId } = data;

    await this.fileService.deleteWorkspaceFolder(workspaceId);
  }
}
