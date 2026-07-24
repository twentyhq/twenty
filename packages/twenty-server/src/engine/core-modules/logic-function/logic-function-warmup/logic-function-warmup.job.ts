import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type LogicFunctionDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type LogicFunctionWarmupJobData = {
  workspaceIds: string[];
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
  async handle({ workspaceIds }: LogicFunctionWarmupJobData): Promise<void> {
    const driver = this.logicFunctionDriverFactory.getCurrentDriver();

    for (const workspaceId of workspaceIds) {
      try {
        await this.warmWorkspaceLayers(driver, workspaceId);
      } catch (error) {
        this.logger.error(
          `Failed to warm layers for workspace ${workspaceId}: ${error}`,
        );
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: workspaceId },
        });
      }
    }
  }

  private async warmWorkspaceLayers(
    driver: LogicFunctionDriver,
    workspaceId: string,
  ): Promise<void> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    // Applications sharing the same layer checksums share layers, so one
    // warmup per distinct layer is enough
    const applicationsWithDistinctLayers = new Map<string, FlatApplication>();

    for (const flatApplication of Object.values(flatApplicationMaps.byId)) {
      if (!isDefined(flatApplication) || isDefined(flatApplication.deletedAt)) {
        continue;
      }

      const layerKey = `${flatApplication.packageJsonChecksum}|${flatApplication.yarnLockChecksum}`;

      if (!applicationsWithDistinctLayers.has(layerKey)) {
        applicationsWithDistinctLayers.set(layerKey, flatApplication);
      }
    }

    for (const flatApplication of applicationsWithDistinctLayers.values()) {
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
