import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type TriggerInstallApplicationJobData = {
  applicationRegistrationId: string;
  workspaceId: string;
};

@Processor(MessageQueue.workspaceQueue)
export class TriggerInstallApplicationJob {
  constructor(
    private readonly applicationInstallService: ApplicationInstallService,
  ) {}

  @Process(TriggerInstallApplicationJob.name)
  async handle(
    data: TriggerInstallApplicationJobData,
    { updateProgress }: MessageQueueJobProgressContext,
  ): Promise<void> {
    await this.applicationInstallService.installApplication({
      appRegistrationId: data.applicationRegistrationId,
      workspaceId: data.workspaceId,
      hasUserApprovedCapabilities: true,
      updateProgress,
    });
  }
}
