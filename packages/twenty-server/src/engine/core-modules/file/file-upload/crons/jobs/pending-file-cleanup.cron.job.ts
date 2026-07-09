import { Injectable, Logger } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { PENDING_FILE_CLEANUP_CRON_PATTERN } from 'src/engine/core-modules/file/file-upload/crons/constants/pending-file-cleanup.constants';
import { PendingFileCleanupService } from 'src/engine/core-modules/file/file-upload/services/pending-file-cleanup.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class PendingFileCleanupCronJob {
  private readonly logger = new Logger(PendingFileCleanupCronJob.name);

  constructor(
    private readonly pendingFileCleanupService: PendingFileCleanupService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(PendingFileCleanupCronJob.name)
  @SentryCronMonitor(
    PendingFileCleanupCronJob.name,
    PENDING_FILE_CLEANUP_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    try {
      const deletedCount =
        await this.pendingFileCleanupService.cleanupStalePendingFiles();

      if (deletedCount > 0) {
        this.logger.log(
          `Pending file cleanup completed: ${deletedCount} stale file(s) deleted`,
        );
      }
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error]);
      throw error;
    }
  }
}
