import { isDefined } from 'twenty-shared/utils';

import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { findLogicFunctionIdsToKeepWarm } from 'src/engine/core-modules/logic-function/logic-function-warm-up/utils/find-logic-function-ids-to-keep-warm.util';
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

    const logicFunctionIds = findLogicFunctionIdsToKeepWarm({
      flatLogicFunctions: Object.values(
        flatLogicFunctionMaps.byUniversalIdentifier,
      ),
      isApplicationActive: (applicationId) =>
        isDefined(
          findActiveFlatApplicationById(flatApplicationMaps, applicationId),
        ),
    });

    // warmUp is best-effort and never throws.
    await Promise.all(
      logicFunctionIds.map((logicFunctionId) =>
        this.logicFunctionExecutorService.warmUp({
          workspaceId,
          logicFunctionId,
        }),
      ),
    );
  }
}
