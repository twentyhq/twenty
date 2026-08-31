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
  constructor(
    private readonly applicationUpgradeService: ApplicationUpgradeService,
  ) {}

  @Process(UPGRADE_APPLICATION_JOB_NAME)
  async handle(data: UpgradeApplicationJobData): Promise<void> {
    await this.applicationUpgradeService.runEnqueuedUpgrade({
      appRegistrationId: data.appRegistrationId,
      targetVersion: data.targetVersion,
      workspaceId: data.workspaceId,
      initiatorUserWorkspaceId: data.initiatorUserWorkspaceId,
    });
  }
}
