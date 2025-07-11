import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import {
    CleanupOrphanedFilesJob,
    CleanupOrphanedFilesJobData,
} from 'src/engine/core-modules/file/jobs/cleanup-orphaned-files.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export const CLEANUP_ORPHANED_FILES_CRON_PATTERN = '0 2 * * *';

@Processor(MessageQueue.cronQueue)
export class CleanupOrphanedFilesCronJob {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FileEntity, 'core')
    private readonly fileRepository: Repository<FileEntity>,
    @InjectMessageQueue(MessageQueue.deleteCascadeQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
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
    });

    for (const activeWorkspace of activeWorkspaces) {
      try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const orphanedFiles = await this.fileRepository
          .createQueryBuilder('file')
          .select(['file.id'])
          .where('file.workspaceId = :workspaceId', {
            workspaceId: activeWorkspace.id,
          })
          .andWhere('file.messageId IS NULL')
          .andWhere('file.createdAt < :oneHourAgo', { oneHourAgo })
          .getMany();

        if (orphanedFiles.length === 0) {
          continue;
        }

        // Process files in batches of 100 to avoid memory issues
        const batchSize = 100;
        const fileBatches = chunk(orphanedFiles, batchSize);

        for (const batch of fileBatches) {
          const fileIds = batch.map((file) => file.id);

          await this.messageQueueService.add<CleanupOrphanedFilesJobData>(
            CleanupOrphanedFilesJob.name,
            {
              workspaceId: activeWorkspace.id,
              fileIds,
            },
            { retryLimit: 3 },
          );
        }
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: activeWorkspace.id,
          },
        });
      }
    }
  }
}
