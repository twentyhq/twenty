import { Inject, Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';

import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const INSTALL_BATCH_SIZE = 20;

export type InstallPrebuiltLogicFunctionBundlesJobData = {
  workspaceId: string;
  logicFunctionIds: string[];
};

@Processor(MessageQueue.logicFunctionQueue)
export class InstallPrebuiltLogicFunctionBundlesJob {
  private readonly logger = new Logger(
    InstallPrebuiltLogicFunctionBundlesJob.name,
  );

  constructor(
    @Inject(LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN)
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @Process(InstallPrebuiltLogicFunctionBundlesJob.name)
  async handle({
    workspaceId,
    logicFunctionIds,
  }: InstallPrebuiltLogicFunctionBundlesJobData): Promise<void> {
    // The mode flip was a raw UPDATE, so cached maps still carry LIVE and
    // executions would keep using live code until an unrelated invalidation.
    await this.workspaceCacheService.flush(workspaceId, [
      'flatLogicFunctionMaps',
    ]);

    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
        'flatApplicationMaps',
      ]);

    const driver = this.logicFunctionDriverFactory.getCurrentDriver();

    for (const logicFunctionIdBatch of chunk(
      logicFunctionIds,
      INSTALL_BATCH_SIZE,
    )) {
      await Promise.all(
        logicFunctionIdBatch.map(async (logicFunctionId) => {
          const flatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: logicFunctionId,
            flatEntityMaps: flatLogicFunctionMaps,
          });
          const flatApplication = isDefined(flatLogicFunction?.applicationId)
            ? flatApplicationMaps.byId[flatLogicFunction.applicationId]
            : undefined;

          if (!isDefined(flatLogicFunction) || !isDefined(flatApplication)) {
            this.logger.warn(
              `Skipping prebuilt bundle install for function '${logicFunctionId}' (workspace=${workspaceId}): function or application not found in workspace cache`,
            );

            return;
          }

          try {
            await driver.installPrebuiltBundle({
              flatLogicFunction,
              flatApplication,
              applicationUniversalIdentifier:
                flatApplication.universalIdentifier,
            });
          } catch (error) {
            // Warming only: the executor installs the bundle on-demand at first
            // execution, so one failed install must not fail the whole job.
            this.logger.warn(
              `Failed to install prebuilt bundle for function '${logicFunctionId}' (workspace=${workspaceId}): ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
          }
        }),
      );
    }
  }
}
