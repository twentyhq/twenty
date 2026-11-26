import { isDefined } from 'twenty-shared/utils';

import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { isLogicFunctionWarmEligible } from 'src/engine/core-modules/logic-function/logic-function-warm-up/utils/is-logic-function-warm-eligible.util';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type KeepWarmWorkspaceLogicFunctionsJobData = {
  workspaceId: string;
};

@Processor(MessageQueue.logicFunctionQueue)
export class KeepWarmWorkspaceLogicFunctionsJob {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
  ) {}

  @Process(KeepWarmWorkspaceLogicFunctionsJob.name)
  async handle({
    workspaceId,
  }: KeepWarmWorkspaceLogicFunctionsJobData): Promise<void> {
    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
        'flatApplicationMaps',
      ]);

    const warmLogicFunctionIds = Object.values(
      flatLogicFunctionMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatLogicFunction) =>
          !isDefined(flatLogicFunction.deletedAt) &&
          isLogicFunctionWarmEligible(flatLogicFunction) &&
          isDefined(
            findActiveFlatApplicationById(
              flatApplicationMaps,
              flatLogicFunction.applicationId,
            ),
          ),
      )
      .map((flatLogicFunction) => flatLogicFunction.id);

    // warmUp is best-effort and never throws.
    await Promise.all(
      warmLogicFunctionIds.map((logicFunctionId) =>
        this.logicFunctionExecutorService.warmUp({
          workspaceId,
          logicFunctionId,
        }),
      ),
    );
  }
}
