import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import {
  INSTALL_APPLICATIONS_JOB_NAME,
  type InstallApplicationsJobData,
} from 'src/engine/core-modules/application/jobs/install-applications.job-constants';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.workspaceQueue)
export class InstallApplicationsJob {
  constructor(
    private readonly applicationInstallService: ApplicationInstallService,
  ) {}

  @Process(INSTALL_APPLICATIONS_JOB_NAME)
  async handle({
    applications,
    isStateAlreadyTransitioned,
    workspaceId,
  }: InstallApplicationsJobData): Promise<void> {
    await this.applicationInstallService.installApplications({
      applications,
      isStateAlreadyTransitioned,
      workspaceId,
    });
  }
}
