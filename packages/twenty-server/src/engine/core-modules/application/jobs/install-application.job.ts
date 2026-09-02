import { Logger } from '@nestjs/common';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import {
  INSTALL_APPLICATION_JOB_NAME,
  type InstallApplicationJobData,
} from 'src/engine/core-modules/application/jobs/install-application.job-constants';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.workspaceQueue)
export class InstallApplicationJob {
  private readonly logger = new Logger(InstallApplicationJob.name);

  constructor(
    private readonly applicationInstallService: ApplicationInstallService,
  ) {}

  @Process(INSTALL_APPLICATION_JOB_NAME)
  async handle({
    appRegistrationId,
    universalIdentifier,
    version,
    workspaceId,
  }: InstallApplicationJobData): Promise<void> {
    this.logger.log(
      `Installing application ${universalIdentifier} in workspace ${workspaceId}`,
    );

    try {
      await this.applicationInstallService.installApplication({
        appRegistrationId,
        version,
        workspaceId,
        hasPreClaimedState: true,
      });
    } catch (error) {
      this.logger.error(
        `Install job failed for application ${universalIdentifier} in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      throw error;
    }

    this.logger.log(
      `Installed application ${universalIdentifier} in workspace ${workspaceId}`,
    );
  }
}
