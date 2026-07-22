import { isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { transformEventBatchToEventPayloads } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/transform-event-batch-to-event-payloads';
import {
  LogicFunctionTriggerJob,
  LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { resolveTriggerRetryLimit } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/resolve-trigger-retry-limit.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

const DEFAULT_DATABASE_EVENT_RETRY_LIMIT = 3;

@Processor(MessageQueue.triggerQueue)
export class CallDatabaseEventTriggerJobsJob {
  constructor(
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @Process(CallDatabaseEventTriggerJobsJob.name)
  async handle(workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>) {
    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(
        workspaceEventBatch.workspaceId,
        ['flatLogicFunctionMaps'],
      );

    const logicFunctionsWithDatabaseEventTrigger = Object.values(
      flatLogicFunctionMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (logicFunction) =>
          !isDefined(logicFunction.deletedAt) &&
          isDefined(logicFunction.databaseEventTriggerSettings),
      );

    const logicFunctionsToTrigger =
      logicFunctionsWithDatabaseEventTrigger.filter((logicFunction) =>
        this.shouldTriggerJob({
          workspaceEventBatch,
          eventName: isDefined(logicFunction.databaseEventTriggerSettings)
            ? logicFunction.databaseEventTriggerSettings.eventName
            : '',
        }),
      );

    const logicFunctionPayloads = transformEventBatchToEventPayloads({
      logicFunctions: logicFunctionsToTrigger,
      workspaceEventBatch,
    });

    if (logicFunctionPayloads.length === 0) {
      return;
    }

    const retryLimitByLogicFunctionId = new Map(
      logicFunctionsToTrigger.map((logicFunction) => [
        logicFunction.id,
        resolveTriggerRetryLimit({
          declaredRetryLimit:
            logicFunction.databaseEventTriggerSettings?.retryLimit,
          defaultRetryLimit: DEFAULT_DATABASE_EVENT_RETRY_LIMIT,
        }),
      ]),
    );

    const payloadsByRetryLimit = new Map<
      number,
      LogicFunctionTriggerJobData[]
    >();

    for (const logicFunctionPayload of logicFunctionPayloads) {
      const retryLimit =
        retryLimitByLogicFunctionId.get(logicFunctionPayload.logicFunctionId) ??
        DEFAULT_DATABASE_EVENT_RETRY_LIMIT;

      payloadsByRetryLimit.set(retryLimit, [
        ...(payloadsByRetryLimit.get(retryLimit) ?? []),
        logicFunctionPayload,
      ]);
    }

    await Promise.all(
      [...payloadsByRetryLimit.entries()].map(([retryLimit, payloads]) =>
        this.messageQueueService.addBulk<LogicFunctionTriggerJobData[]>(
          LogicFunctionTriggerJob.name,
          payloads.map((logicFunctionPayload) => [logicFunctionPayload]),
          { retryLimit },
        ),
      ),
    );
  }

  private shouldTriggerJob({
    workspaceEventBatch,
    eventName,
  }: {
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
    eventName: string;
  }) {
    const [nameSingular, operation] = workspaceEventBatch.name.split('.');

    const validEventNames = [
      `${nameSingular}.${operation}`,
      `*.${operation}`,
      `${nameSingular}.*`,
      '*.*',
    ];

    return validEventNames.includes(eventName);
  }
}
