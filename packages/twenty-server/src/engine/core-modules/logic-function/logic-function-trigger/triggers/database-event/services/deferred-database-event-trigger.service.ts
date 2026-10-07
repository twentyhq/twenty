import { Injectable, Logger } from '@nestjs/common';

import { type WorkspaceSignalName } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-queue-retry-backoff.constant';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { DEFERRED_DATABASE_EVENT_TRIGGER_FLUSH_DELAY_MS } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/constants/deferred-database-event-trigger-flush-delay-ms.constant';
import { DEFERRED_DATABASE_EVENT_TRIGGER_TTL_MS } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/constants/deferred-database-event-trigger-ttl-ms.constant';
import {
  collectSignalNamesFromConditions,
  evaluateDatabaseEventTriggerSignalConditions,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/evaluate-database-event-trigger-signal-conditions.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceSignalService } from 'src/engine/core-modules/workspace-signal/services/workspace-signal.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';

@Injectable()
export class DeferredDatabaseEventTriggerService {
  private readonly logger = new Logger(
    DeferredDatabaseEventTriggerService.name,
  );

  constructor(
    @InjectCacheStorage(
      CacheStorageNamespace.EngineDeferredDatabaseEventTrigger,
    )
    private readonly cacheStorage: CacheStorageService,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceSignalService: WorkspaceSignalService,
  ) {}

  async defer({
    workspaceId,
    signal,
    logicFunctionId,
    droppedEventCount,
  }: {
    workspaceId: string;
    signal: WorkspaceSignalName;
    logicFunctionId: string;
    droppedEventCount: number;
  }): Promise<void> {
    await this.cacheStorage.setAdd(
      this.buildDeferredSetKey({ workspaceId, signal }),
      [logicFunctionId],
      DEFERRED_DATABASE_EVENT_TRIGGER_TTL_MS,
    );
    await this.cacheStorage.setIfAbsent(
      this.buildSinceKey({ workspaceId, logicFunctionId }),
      new Date().toISOString(),
      DEFERRED_DATABASE_EVENT_TRIGGER_TTL_MS,
    );

    if (droppedEventCount > 0) {
      const droppedKey = this.buildDroppedKey({ workspaceId, logicFunctionId });

      await this.cacheStorage.incrBy(droppedKey, droppedEventCount);
      await this.cacheStorage.expire(
        droppedKey,
        DEFERRED_DATABASE_EVENT_TRIGGER_TTL_MS,
      );
    }
  }

  async flush({
    workspaceId,
    signal,
  }: {
    workspaceId: string;
    signal: WorkspaceSignalName;
  }): Promise<void> {
    const deferredSetKey = this.buildDeferredSetKey({ workspaceId, signal });
    const logicFunctionIds = await this.cacheStorage.setMembers(deferredSetKey);

    if (logicFunctionIds.length === 0) {
      return;
    }

    const { flatLogicFunctionMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
        'flatObjectMetadataMaps',
      ]);

    const logicFunctions = logicFunctionIds
      .map((logicFunctionId) =>
        findFlatEntityByIdInFlatEntityMaps<FlatLogicFunction>({
          flatEntityMaps: flatLogicFunctionMaps,
          flatEntityId: logicFunctionId,
        }),
      )
      .filter(
        (logicFunction): logicFunction is FlatLogicFunction =>
          isDefined(logicFunction) &&
          !isDefined(logicFunction.deletedAt) &&
          isDefined(logicFunction.databaseEventTriggerSettings),
      );

    const signalStates = await this.workspaceSignalService.read({
      workspaceId,
      names: collectSignalNamesFromConditions(
        logicFunctions.map(
          (logicFunction) =>
            logicFunction.databaseEventTriggerSettings?.conditions?.signals,
        ),
      ),
    });

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );
    const jobs: { data: LogicFunctionTriggerJobData }[] = [];
    const settledLogicFunctionIds: string[] = [];
    const retainedLogicFunctionIds = new Set<string>();

    for (const logicFunction of logicFunctions) {
      const triggerSettings = logicFunction.databaseEventTriggerSettings;

      if (!isDefined(triggerSettings)) {
        continue;
      }

      const evaluation = evaluateDatabaseEventTriggerSignalConditions({
        signalConditions: triggerSettings.conditions?.signals,
        signalStates,
      });

      if (!evaluation.matches) {
        await this.defer({
          workspaceId,
          signal: evaluation.mismatchedSignal,
          logicFunctionId: logicFunction.id,
          droppedEventCount: 0,
        });

        if (evaluation.mismatchedSignal === signal) {
          retainedLogicFunctionIds.add(logicFunction.id);
        }
        continue;
      }

      settledLogicFunctionIds.push(logicFunction.id);

      const { objectSingularName } = parseEventNameOrThrow(
        triggerSettings.eventName,
      );
      const objectMetadata =
        findFlatEntityByIdInFlatEntityMaps<FlatObjectMetadata>({
          flatEntityMaps: flatObjectMetadataMaps,
          flatEntityId: idByNameSingular[objectSingularName],
        });

      if (!isDefined(objectMetadata)) {
        this.logger.warn(
          `Skipping catch-up of function ${logicFunction.id} (workspace ${workspaceId}): object ${objectSingularName} not found`,
        );
        continue;
      }

      const [since, droppedEventCount] = await Promise.all([
        this.cacheStorage.get<string>(
          this.buildSinceKey({
            workspaceId,
            logicFunctionId: logicFunction.id,
          }),
        ),
        this.cacheStorage.get<number>(
          this.buildDroppedKey({
            workspaceId,
            logicFunctionId: logicFunction.id,
          }),
        ),
      ]);

      jobs.push({
        data: {
          logicFunctionId: logicFunction.id,
          workspaceId,
          payload: {
            name: triggerSettings.eventName,
            workspaceId,
            objectMetadata,
            events: [],
            deferred: {
              signal,
              since: since ?? new Date().toISOString(),
              droppedEventCount: droppedEventCount ?? 0,
            },
          },
        },
      });
    }

    if (jobs.length > 0) {
      await this.messageQueueService.bulkAdd<LogicFunctionTriggerJobData>(
        LogicFunctionTriggerJob.name,
        jobs,
        {
          retryLimit: 3,
          backoff: LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF,
          delay: DEFERRED_DATABASE_EVENT_TRIGGER_FLUSH_DELAY_MS,
        },
      );
    }

    await this.cacheStorage.setRemove(
      deferredSetKey,
      logicFunctionIds.filter(
        (logicFunctionId) => !retainedLogicFunctionIds.has(logicFunctionId),
      ),
    );

    if (settledLogicFunctionIds.length > 0) {
      await this.cacheStorage.mdel(
        settledLogicFunctionIds.flatMap((logicFunctionId) => [
          this.buildSinceKey({ workspaceId, logicFunctionId }),
          this.buildDroppedKey({ workspaceId, logicFunctionId }),
        ]),
      );
    }
  }

  private buildDeferredSetKey({
    workspaceId,
    signal,
  }: {
    workspaceId: string;
    signal: WorkspaceSignalName;
  }): string {
    return `${workspaceId}:${signal}`;
  }

  private buildSinceKey({
    workspaceId,
    logicFunctionId,
  }: {
    workspaceId: string;
    logicFunctionId: string;
  }): string {
    return `${workspaceId}:${logicFunctionId}:since`;
  }

  private buildDroppedKey({
    workspaceId,
    logicFunctionId,
  }: {
    workspaceId: string;
    logicFunctionId: string;
  }): string {
    return `${workspaceId}:${logicFunctionId}:dropped`;
  }
}
