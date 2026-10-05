import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import {
  UPGRADE_WORKSPACE_APPLICATION_JOB_NAME,
  type UpgradeWorkspaceApplicationJobData,
} from 'src/engine/core-modules/application/jobs/upgrade-workspace-application.job-constants';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.applicationUpgradeQueue)
export class UpgradeWorkspaceApplicationJob {
  constructor(
    private readonly applicationUpgradeService: ApplicationUpgradeService,
  ) {}

  @Process(UPGRADE_WORKSPACE_APPLICATION_JOB_NAME)
  async handle(data: UpgradeWorkspaceApplicationJobData): Promise<void> {
    await this.applicationUpgradeService.upgradeWorkspaceApplicationToLatestVersion(
      {
        applicationRegistrationId: data.applicationRegistrationId,
        workspaceId: data.workspaceId,
        onlyAutoUpgrade: data.onlyAutoUpgrade,
      },
    );
  }
}
