import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import {
  GENERATE_SDK_CLIENT_JOB_NAME,
  type GenerateSdkClientJobData,
} from 'src/engine/core-modules/sdk-client/jobs/generate-sdk-client.job-constants';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';

@Processor(MessageQueue.workspaceQueue)
export class GenerateSdkClientJob {
  constructor(
    private readonly sdkClientGenerationService: SdkClientGenerationService,
  ) {}

  @Process(GENERATE_SDK_CLIENT_JOB_NAME)
  async handle(data: GenerateSdkClientJobData): Promise<void> {
    await this.sdkClientGenerationService.generateSdkClientForApplication({
      workspaceId: data.workspaceId,
      applicationId: data.applicationId,
      applicationUniversalIdentifier: data.applicationUniversalIdentifier,
    });
  }
}
