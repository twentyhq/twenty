import { Injectable, Logger } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WORKSPACE_DATA_EXPORT_CLEANUP_CRON_PATTERN } from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constant';
import { WorkspaceDataExportCleanupService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-cleanup.service';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class WorkspaceDataExportCleanupCronJob {
  private readonly logger = new Logger(WorkspaceDataExportCleanupCronJob.name);

  constructor(
    private readonly workspaceDataExportCleanupService: WorkspaceDataExportCleanupService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(WorkspaceDataExportCleanupCronJob.name)
  @SentryCronMonitor(
    WorkspaceDataExportCleanupCronJob.name,
    WORKSPACE_DATA_EXPORT_CLEANUP_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    try {
      const deletedCount =
        await this.workspaceDataExportCleanupService.cleanupExpiredExports();

      if (deletedCount > 0) {
        this.logger.log(
          `Workspace data export cleanup: ${deletedCount} export(s) deleted`,
        );
      }
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error]);
      throw error;
    }
  }
}
