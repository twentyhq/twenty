import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type LogicFunctionWarmupJobData = {
  workspaceId: string;
};

@Processor(MessageQueue.logicFunctionQueue)
export class LogicFunctionWarmupJob {
  private readonly logger = new Logger(LogicFunctionWarmupJob.name);

  constructor(
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(LogicFunctionWarmupJob.name)
  async handle({ workspaceId }: LogicFunctionWarmupJobData): Promise<void> {
    const driver = this.logicFunctionDriverFactory.getCurrentDriver();

    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    for (const flatApplication of Object.values(flatApplicationMaps.byId)) {
      if (!isDefined(flatApplication) || isDefined(flatApplication.deletedAt)) {
        continue;
      }

      try {
        await driver.warmLayers({
          flatApplication,
          applicationUniversalIdentifier: flatApplication.universalIdentifier,
        });
      } catch (error) {
        this.logger.error(
          `Failed to warm layers for application ${flatApplication.id} in workspace ${workspaceId}: ${error}`,
        );
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: workspaceId },
        });
      }
    }
  }
}
