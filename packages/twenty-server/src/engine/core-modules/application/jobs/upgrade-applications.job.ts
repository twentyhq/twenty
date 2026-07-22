import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import {
  UPGRADE_APPLICATIONS_JOB_NAME,
  type UpgradeApplicationsJobData,
} from 'src/engine/core-modules/application/jobs/upgrade-applications.job-constants';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.workspaceQueue)
export class UpgradeApplicationsJob {
  constructor(
    private readonly applicationUpgradeService: ApplicationUpgradeService,
  ) {}

  @Process(UPGRADE_APPLICATIONS_JOB_NAME)
  async handle(data: UpgradeApplicationsJobData): Promise<void> {
    await this.applicationUpgradeService.upgradeAllApplications({
      applicationRegistrationId: data.applicationRegistrationId,
      onlyAutoUpgrade: data.onlyAutoUpgrade,
      batchSize: data.batchSize,
    });
  }
}
