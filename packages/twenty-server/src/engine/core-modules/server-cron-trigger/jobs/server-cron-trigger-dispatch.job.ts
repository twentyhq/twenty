import { Logger, Scope } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type ServerCronTriggerDispatchJobData = {
  resolverLogicFunctionId: string;
  ownerWorkspaceId: string;
  targetLogicFunctionUniversalIdentifier: string;
};

@Processor({
  queueName: MessageQueue.cronQueue,
  scope: Scope.REQUEST,
})
export class ServerCronTriggerDispatchJob {
  private readonly logger = new Logger(ServerCronTriggerDispatchJob.name);

  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly logicFunctionQueueService: MessageQueueService,
  ) {}

  @Process(ServerCronTriggerDispatchJob.name)
  async handle(data: ServerCronTriggerDispatchJobData): Promise<void> {
    const result = await this.logicFunctionExecutorService.execute({
      logicFunctionId: data.resolverLogicFunctionId,
      workspaceId: data.ownerWorkspaceId,
      payload: { source: 'server-cron' },
    });

    if (isDefined(result.error)) {
      this.logger.error(
        `Server cron resolver ${data.resolverLogicFunctionId} failed: ${result.error.errorMessage}`,
      );

      return;
    }

    const workspaceIds = this.parseResolverWorkspaceIds(result.data);

    if (workspaceIds.length === 0) {
      return;
    }

    for (const workspaceId of workspaceIds) {
      const targetLogicFunctionId = await this.findTargetLogicFunctionId({
        workspaceId,
        universalIdentifier: data.targetLogicFunctionUniversalIdentifier,
      });

      if (!isDefined(targetLogicFunctionId)) {
        this.logger.warn(
          `Server cron target ${data.targetLogicFunctionUniversalIdentifier} not found in workspace ${workspaceId}`,
        );
        continue;
      }

      await this.logicFunctionQueueService.add<LogicFunctionTriggerJobData[]>(
        LogicFunctionTriggerJob.name,
        [
          {
            logicFunctionId: targetLogicFunctionId,
            workspaceId,
            payload: { source: 'server-cron' },
          },
        ],
        { retryLimit: 3 },
      );
    }
  }

  private parseResolverWorkspaceIds(data: object | null): string[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.filter((entry): entry is string => typeof entry === 'string');
  }

  private async findTargetLogicFunctionId({
    workspaceId,
    universalIdentifier,
  }: {
    workspaceId: string;
    universalIdentifier: string;
  }): Promise<string | undefined> {
    try {
      const { flatLogicFunctionMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatLogicFunctionMaps',
        ]);

      const candidate = Object.values(
        flatLogicFunctionMaps.byUniversalIdentifier,
      ).find(
        (logicFunction) =>
          isDefined(logicFunction) &&
          logicFunction.universalIdentifier === universalIdentifier &&
          !isDefined(logicFunction.deletedAt),
      );

      return isDefined(candidate) ? candidate.id : undefined;
    } catch (error) {
      this.logger.warn(
        `Failed to resolve target ${universalIdentifier} in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return undefined;
    }
  }
}
