import { Scope } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type LogicFunctionTriggerJobData = {
  logicFunctionId: string;
  workspaceId: string;
  payload?: object;
  userId?: string;
  userWorkspaceId?: string;
};

@Processor({
  queueName: MessageQueue.logicFunctionQueue,
  scope: Scope.REQUEST,
})
export class LogicFunctionTriggerJob {
  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @Process(LogicFunctionTriggerJob.name)
  async handle(logicFunctionPayloads: LogicFunctionTriggerJobData[]) {
    await Promise.all(
      logicFunctionPayloads.map(async (logicFunctionPayload) => {
        const result = await this.logicFunctionExecutorService.execute({
          logicFunctionId: logicFunctionPayload.logicFunctionId,
          workspaceId: logicFunctionPayload.workspaceId,
          payload: logicFunctionPayload.payload ?? {},
          userId: logicFunctionPayload.userId,
          userWorkspaceId: logicFunctionPayload.userWorkspaceId,
        });

        if (!isDefined(result.error)) {
          return;
        }

        const shouldRetryOnFailure =
          await this.getShouldRetryOnFailure(logicFunctionPayload);

        if (shouldRetryOnFailure) {
          throw new Error(
            `Logic function ${logicFunctionPayload.logicFunctionId} failed: ${result.error.errorMessage}`,
          );
        }
      }),
    );
  }

  private async getShouldRetryOnFailure({
    logicFunctionId,
    workspaceId,
  }: LogicFunctionTriggerJobData): Promise<boolean> {
    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
      ]);

    const flatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: logicFunctionId,
      flatEntityMaps: flatLogicFunctionMaps,
    });

    return flatLogicFunction?.shouldRetryOnFailure === true;
  }
}
