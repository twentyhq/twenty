import { Logger } from '@nestjs/common';

import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import {
  UNINSTALL_APPLICATION_JOB_NAME,
  type UninstallApplicationJobData,
} from 'src/engine/core-modules/application/jobs/uninstall-application.job-constants';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.workspaceQueue)
export class UninstallApplicationJob {
  private readonly logger = new Logger(UninstallApplicationJob.name);

  constructor(
    private readonly applicationSyncService: ApplicationSyncService,
  ) {}

  @Process(UNINSTALL_APPLICATION_JOB_NAME)
  async handle({
    universalIdentifier,
    workspaceId,
  }: UninstallApplicationJobData): Promise<void> {
    this.logger.log(
      `Uninstalling application ${universalIdentifier} in workspace ${workspaceId}`,
    );

    try {
      await this.applicationSyncService.uninstallApplicationWithMetrics({
        applicationUniversalIdentifier: universalIdentifier,
        workspaceId,
        isStateAlreadyTransitioned: true,
      });
    } catch (error) {
      this.logger.error(
        `Uninstall job failed for application ${universalIdentifier} in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      throw error;
    }

    this.logger.log(
      `Uninstalled application ${universalIdentifier} in workspace ${workspaceId}`,
    );
  }
}
