import { Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ApplicationJobEnqueueThrottlerService } from 'src/engine/core-modules/message-queue/services/application-job-enqueue-throttler.service';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-queue-retry-backoff.constant';
import { transformEventBatchToEventPayloads } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/transform-event-batch-to-event-payloads';
import {
  LogicFunctionTriggerJob,
  LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { InheritedRecordAccessService } from 'src/engine/record-share/services/inherited-record-access.service';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { buildRecordShareGate } from 'src/engine/record-share/utils/build-record-share-gate.util';
import { indexRecordSharesByRecordId } from 'src/engine/record-share/utils/index-record-shares-by-record-id.util';
import { isRecordSharedWithPrincipals } from 'src/engine/record-share/utils/is-record-shared-with-principals.util';
import { resolveRecordShareGateKind } from 'src/engine/record-share/utils/resolve-record-share-gate-kind.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/twenty-orm/repository/resolve-required-record-share-access-levels.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

@Processor(MessageQueue.triggerQueue)
export class CallDatabaseEventTriggerJobsJob {
  private readonly logger = new Logger(CallDatabaseEventTriggerJobsJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationJobEnqueueThrottlerService: ApplicationJobEnqueueThrottlerService,
    private readonly recordShareService: RecordShareService,
    private readonly inheritedRecordAccessService: InheritedRecordAccessService,
  ) {}

  @Process(CallDatabaseEventTriggerJobsJob.name)
  async handle(workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>) {
    const {
      flatLogicFunctionMaps,
      flatApplicationMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      featureFlagsMap,
    } = await this.workspaceCacheService.getOrRecompute(
      workspaceEventBatch.workspaceId,
      [
        'flatLogicFunctionMaps',
        'flatApplicationMaps',
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'featureFlagsMap',
      ],
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

    const logicFunctionsByApplicationId = new Map<
      string,
      typeof logicFunctionsToTrigger
    >();

    for (const logicFunction of logicFunctionsToTrigger) {
      const applicationLogicFunctions =
        logicFunctionsByApplicationId.get(logicFunction.applicationId) ?? [];

      applicationLogicFunctions.push(logicFunction);
      logicFunctionsByApplicationId.set(
        logicFunction.applicationId,
        applicationLogicFunctions,
      );
    }

    if (logicFunctionsByApplicationId.size === 0) {
      return;
    }

    const isRecordShareGated =
      featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARING_ENABLED];

    let recordSharesByRecordIdPromise:
      | Promise<Map<string, RecordShare[]>>
      | undefined;
    const fetchRecordSharesByRecordId = () =>
      (recordSharesByRecordIdPromise ??= this.recordShareService
        .findByRecordIds({
          workspaceId: workspaceEventBatch.workspaceId,
          objectMetadataId: workspaceEventBatch.objectMetadata.id,
          recordIds: workspaceEventBatch.events.map((event) => event.recordId),
        })
        .then(indexRecordSharesByRecordId));

    for (const [
      applicationId,
      logicFunctions,
    ] of logicFunctionsByApplicationId) {
      const application = findActiveFlatApplicationById(
        flatApplicationMaps,
        applicationId,
      );
      const applicationRegistrationId = application?.applicationRegistrationId;

      if (!isDefined(application) || !isDefined(applicationRegistrationId)) {
        continue;
      }

      const logicFunctionPayloads = transformEventBatchToEventPayloads({
        logicFunctions,
        workspaceEventBatch: await this.filterEventsSharedWithApplication({
          workspaceEventBatch,
          application,
          isRecordShareGated,
          fetchRecordSharesByRecordId,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        }),
      });

      if (logicFunctionPayloads.length === 0) {
        continue;
      }

      try {
        await this.applicationJobEnqueueThrottlerService.throttleOrThrow({
          applicationId,
          applicationRegistrationId,
          jobCount: logicFunctionPayloads.length,
        });
      } catch (error) {
        if (error instanceof ThrottlerException) {
          this.logger.warn(
            `Enqueue throttled for application ${applicationId} (registration ${applicationRegistrationId}) in workspace ${workspaceEventBatch.workspaceId}: skipping ${logicFunctionPayloads.length} logic function trigger(s)`,
          );

          continue;
        }

        throw error;
      }

      await this.messageQueueService.bulkAdd<LogicFunctionTriggerJobData>(
        LogicFunctionTriggerJob.name,
        logicFunctionPayloads.map((logicFunctionPayload) => ({
          data: logicFunctionPayload,
        })),
        {
          retryLimit: 3,
          backoff: LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF,
        },
      );
    }
  }

  private async filterEventsSharedWithApplication({
    workspaceEventBatch,
    application,
    isRecordShareGated,
    fetchRecordSharesByRecordId,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
    application: FlatApplication;
    isRecordShareGated: boolean;
    fetchRecordSharesByRecordId: () => Promise<Map<string, RecordShare[]>>;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): Promise<WorkspaceEventBatch<ObjectRecordEvent>> {
    const principalIds = [
      EVERYONE_PRINCIPAL_ID,
      application.defaultRoleId,
    ].filter(isNonEmptyString);
    const isOwningApplication =
      workspaceEventBatch.objectMetadata.applicationId === application.id;

    if (
      isRecordShareGated &&
      resolveRecordShareGateKind({
        readability: workspaceEventBatch.objectMetadata.readability,
        isOwningApplication,
      }) === 'inherited'
    ) {
      const authorizedRecordIds =
        await this.inheritedRecordAccessService.resolveAuthorizedEventRecordIds(
          {
            flatObjectMetadata: workspaceEventBatch.objectMetadata,
            events: workspaceEventBatch.events,
            context: {
              workspaceId: workspaceEventBatch.workspaceId,
              principalIds,
              accessLevels: resolveRequiredRecordShareAccessLevels('select'),
              applicationId: application.id,
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
            },
          },
        );

      return {
        ...workspaceEventBatch,
        events: workspaceEventBatch.events.filter((event) =>
          authorizedRecordIds.has(event.recordId),
        ),
      };
    }

    const recordShareGate = isRecordShareGated
      ? await buildRecordShareGate({
          readability: workspaceEventBatch.objectMetadata.readability,
          isOwningApplication,
          principalIds,
          fetchRecordSharesByRecordId,
        })
      : null;

    if (!isDefined(recordShareGate)) {
      return workspaceEventBatch;
    }

    return {
      ...workspaceEventBatch,
      events: workspaceEventBatch.events.filter((event) =>
        isRecordSharedWithPrincipals({
          recordShareGate,
          recordId: event.recordId,
          accessLevels: resolveRequiredRecordShareAccessLevels('select'),
        }),
      ),
    };
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
