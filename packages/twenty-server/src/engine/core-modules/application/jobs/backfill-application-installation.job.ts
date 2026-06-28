import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  BACKFILL_APPLICATION_INSTALLATION_JOB_NAME,
  type BackfillApplicationInstallationJobData,
} from 'src/engine/core-modules/application/jobs/backfill-application-installation.job-constants';
import { PreInstalledAppsService } from 'src/engine/core-modules/application/pre-installed-apps/pre-installed-apps.service';

@Processor(MessageQueue.workspaceQueue)
export class BackfillApplicationInstallationJob {
  constructor(
    private readonly preInstalledAppsService: PreInstalledAppsService,
  ) {}

  @Process(BACKFILL_APPLICATION_INSTALLATION_JOB_NAME)
  async handle(data: BackfillApplicationInstallationJobData): Promise<void> {
    await this.preInstalledAppsService.backfillApplicationOnAllWorkspaces(
      data.applicationRegistrationId,
    );
  }
}
