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
  constructor(
    private readonly applicationInstallService: ApplicationInstallService,
  ) {}

  @Process(INSTALL_APPLICATION_JOB_NAME)
  async handle(data: InstallApplicationJobData): Promise<void> {
    await this.applicationInstallService.runEnqueuedInstall({
      appRegistrationId: data.appRegistrationId,
      version: data.version,
      workspaceId: data.workspaceId,
    });
  }
}
