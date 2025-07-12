import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileMetadataService } from 'src/engine/core-modules/file/services/file-metadata.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type CleanupOrphanedFilesJobData = {
  workspaceId: string;
  fileIds: string[];
};

@Processor(MessageQueue.deleteCascadeQueue)
export class CleanupOrphanedFilesJob {
  constructor(
    @InjectRepository(FileEntity, 'core')
    private readonly fileRepository: Repository<FileEntity>,
    private readonly fileMetadataService: FileMetadataService,
  ) {}

  @Process(CleanupOrphanedFilesJob.name)
  async handle(data: CleanupOrphanedFilesJobData): Promise<void> {
    const { workspaceId, fileIds } = data;

    if (!fileIds || fileIds.length === 0) {
      return;
    }

    const files = await this.fileRepository.find({
      where: {
        id: In(fileIds),
        workspaceId,
      },
    });

    for (const file of files) {
      try {
        await this.fileMetadataService.deleteFileById(file.id, workspaceId);
      } catch (error) {
        throw new Error(
          `[${CleanupOrphanedFilesJob.name}] Cannot delete orphaned file - ${file.fullPath}: ${error.message}`,
        );
      }
    }
  }
}
