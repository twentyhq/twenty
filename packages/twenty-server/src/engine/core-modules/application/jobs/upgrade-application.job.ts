import { Logger } from '@nestjs/common';

import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import {
  UPGRADE_APPLICATION_JOB_NAME,
  type UpgradeApplicationJobData,
} from 'src/engine/core-modules/application/jobs/upgrade-application.job-constants';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.workspaceQueue)
export class UpgradeApplicationJob {
  private readonly logger = new Logger(UpgradeApplicationJob.name);

  constructor(
    private readonly applicationUpgradeService: ApplicationUpgradeService,
  ) {}

  @Process(UPGRADE_APPLICATION_JOB_NAME)
  async handle({
    appRegistrationId,
    universalIdentifier,
    targetVersion,
    workspaceId,
  }: UpgradeApplicationJobData): Promise<void> {
    this.logger.log(
      `Upgrading application ${universalIdentifier} to ${targetVersion} in workspace ${workspaceId}`,
    );

    try {
      await this.applicationUpgradeService.upgradeApplication({
        appRegistrationId,
        targetVersion,
        workspaceId,
        isStateAlreadyTransitioned: true,
      });
    } catch (error) {
      this.logger.error(
        `Upgrade job failed for application ${universalIdentifier} in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      throw error;
    }

    this.logger.log(
      `Upgraded application ${universalIdentifier} to ${targetVersion} in workspace ${workspaceId}`,
    );
  }
}
