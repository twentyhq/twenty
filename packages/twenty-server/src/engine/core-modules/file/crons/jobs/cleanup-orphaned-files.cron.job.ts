import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { IsNull, LessThan, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileMetadataService } from 'src/engine/core-modules/file/services/file-metadata.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export const CLEANUP_ORPHANED_FILES_CRON_PATTERN = '0 2 * * *';

@Processor(MessageQueue.cronQueue)
export class CleanupOrphanedFilesCronJob {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FileEntity, 'core')
    private readonly fileRepository: Repository<FileEntity>,
    private readonly fileMetadataService: FileMetadataService,
  ) {}

  @Process(CleanupOrphanedFilesCronJob.name)
  @SentryCronMonitor(
    CleanupOrphanedFilesCronJob.name,
    CLEANUP_ORPHANED_FILES_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
      select: ['id'],
    });

    if (activeWorkspaces.length === 0) {
      return;
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const orphanedFiles = await this.fileRepository.find({
      select: ['id', 'workspaceId', 'fullPath'],
      where: {
        messageId: IsNull(),
        createdAt: LessThan(oneHourAgo),
      },
    });

    if (orphanedFiles.length === 0) {
      return;
    }

    for (const file of orphanedFiles) {
      await this.fileMetadataService
        .deleteFileById(file.id, file.workspaceId)
        .catch((error) => {
          throw new Error(
            `[${CleanupOrphanedFilesCronJob.name}] Cannot delete orphaned file - ${file.fullPath}: ${error.message}`,
          );
        });
    }
  }
}
