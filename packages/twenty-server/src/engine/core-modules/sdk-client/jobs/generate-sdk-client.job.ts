import { Logger } from '@nestjs/common';

import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';

export type GenerateSdkClientJobData = {
  workspaceId: string;
  applicationId: string;
  applicationUniversalIdentifier: string;
};

@Processor(MessageQueue.workspaceQueue)
export class GenerateSdkClientJob {
  private readonly logger = new Logger(GenerateSdkClientJob.name);

  constructor(
    private readonly sdkClientGenerationService: SdkClientGenerationService,
  ) {}

  @Process(GenerateSdkClientJob.name)
  async handle(data: GenerateSdkClientJobData): Promise<void> {
    try {
      await this.sdkClientGenerationService.generateSdkClientForApplication({
        workspaceId: data.workspaceId,
        applicationId: data.applicationId,
        applicationUniversalIdentifier: data.applicationUniversalIdentifier,
      });
    } catch (error) {
      this.logger.error(
        `Failed to generate SDK client for application "${data.applicationUniversalIdentifier}" in workspace "${data.workspaceId}"`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
