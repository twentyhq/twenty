import { Logger } from '@nestjs/common';

import {
  INSTALL_PRE_INSTALLED_APPS_JOB_NAME,
  type InstallPreInstalledAppsJobData,
} from 'src/engine/core-modules/application/pre-installed-apps/jobs/install-pre-installed-apps.job-constants';
import { PreInstalledAppsService } from 'src/engine/core-modules/application/pre-installed-apps/pre-installed-apps.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.workspaceQueue)
export class InstallPreInstalledAppsJob {
  private readonly logger = new Logger(InstallPreInstalledAppsJob.name);

  constructor(
    private readonly preInstalledAppsService: PreInstalledAppsService,
  ) {}

  @Process(INSTALL_PRE_INSTALLED_APPS_JOB_NAME)
  async handle({ workspaceId }: InstallPreInstalledAppsJobData): Promise<void> {
    this.logger.log(
      `Installing pre-installed apps on workspace ${workspaceId}`,
    );

    await this.preInstalledAppsService.installOnWorkspace(workspaceId);
  }
}
