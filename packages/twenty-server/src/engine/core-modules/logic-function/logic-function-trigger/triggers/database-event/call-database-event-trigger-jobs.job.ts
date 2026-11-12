import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { buildLogicFunctionJobLimiter } from 'src/engine/core-modules/logic-function/utils/build-logic-function-job-limiter.util';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { ApplicationRepeatedEventRecorderService } from 'src/engine/core-modules/event-logs/emit/application-repeated-event-recorder.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueException } from 'src/engine/core-modules/message-queue/message-queue.exception';
import { type MessageQueueJobContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { ApplicationJobEnqueueThrottlerService } from 'src/engine/core-modules/message-queue/services/application-job-enqueue-throttler.service';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-queue-retry-backoff.constant';
import { buildApplicationJobMemoryLimitLogEntry } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/build-application-job-memory-limit-log-entry.util';
import { buildApplicationJobThrottledLogEntry } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/build-application-job-throttled-log-entry.util';
import { buildLogicFunctionTriggerJobIds } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/build-logic-function-trigger-job-ids';
import { findLogicFunctionsTriggeredByEventName } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/find-logic-functions-triggered-by-event-name';
import { buildDatabaseEventTriggerConditionFields } from 'src/engine/workspace-event-emitter/utils/build-database-event-trigger-condition-fields.util';
import { transformEventBatchToEventPayloads } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/transform-event-batch-to-event-payloads';
import {
  LogicFunctionTriggerJob,
  LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { RecordEventPermissionsReadService } from 'src/engine/permissions/record-event-permissions-read.service';
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
    private readonly applicationRepeatedEventRecorderService: ApplicationRepeatedEventRecorderService,
    private readonly recordEventPermissionsReadService: RecordEventPermissionsReadService,
  ) {}

  @Process(CallDatabaseEventTriggerJobsJob.name)
  async handle(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
    { jobId }: MessageQueueJobContext,
  ) {
    const {
      flatLogicFunctionMaps,
      flatApplicationMaps,
      flatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(
      workspaceEventBatch.workspaceId,
      ['flatLogicFunctionMaps', 'flatApplicationMaps', 'flatFieldMetadataMaps'],
    );

    const logicFunctionsToTrigger = findLogicFunctionsTriggeredByEventName({
      flatLogicFunctionMaps,
      eventName: workspaceEventBatch.name,
    });

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

    const conditionFields = buildDatabaseEventTriggerConditionFields({
      flatObjectMetadata: workspaceEventBatch.objectMetadata,
      flatFieldMetadataMaps,
    });

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

      const readableEvents =
        await this.recordEventPermissionsReadService.filterReadableEvents({
          authContext: {
            type: 'application',
            workspace: { id: workspaceEventBatch.workspaceId },
            application,
          },
          eventBatch: workspaceEventBatch,
        });
      const logicFunctionPayloads = transformEventBatchToEventPayloads({
        logicFunctions,
        workspaceEventBatch: {
          ...workspaceEventBatch,
          events: readableEvents,
        },
        conditionFields,
        onConditionError: ({ logicFunctionId, errorMessage }) =>
          this.logger.warn(
            `Condition of logic function ${logicFunctionId} in workspace ${workspaceEventBatch.workspaceId} failed to evaluate: ${errorMessage}`,
          ),
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

          this.applicationRepeatedEventRecorderService.record({
            entry: buildApplicationJobThrottledLogEntry({
              workspaceId: workspaceEventBatch.workspaceId,
              application,
            }),
            occurrenceCount: logicFunctionPayloads.length,
          });

          continue;
        }

        throw error;
      }

      const logicFunctionTriggerJobIds = buildLogicFunctionTriggerJobIds({
        triggerJobId: jobId,
        logicFunctionPayloads,
      });

      const logicFunctionsById = new Map(
        logicFunctions.map((logicFunction) => [
          logicFunction.id,
          logicFunction,
        ]),
      );

      try {
        await this.messageQueueService.bulkAdd<LogicFunctionTriggerJobData>(
          LogicFunctionTriggerJob.name,
          logicFunctionPayloads.map((logicFunctionPayload, index) => ({
            data: {
              ...logicFunctionPayload,
              applicationUniversalIdentifier: application.universalIdentifier,
            },
            jobId: logicFunctionTriggerJobIds[index],
            limiter: buildLogicFunctionJobLimiter({
              logicFunctionId: logicFunctionPayload.logicFunctionId,
              limiter: logicFunctionsById.get(
                logicFunctionPayload.logicFunctionId,
              )?.jobConfig?.limiter,
            }),
            workspaceId: workspaceEventBatch.workspaceId,
            applicationUniversalIdentifier: application.universalIdentifier,
          })),
          {
            retryLimit: 3,
            backoff: LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF,
            doNotCheckDuplicatesBasedOnPrefix: true,
          },
        );
      } catch (error) {
        if (!(error instanceof MessageQueueException)) {
          throw error;
        }

        this.logger.warn(
          `Enqueue refused for application ${applicationId} in workspace ${workspaceEventBatch.workspaceId}: skipping ${logicFunctionPayloads.length} logic function trigger(s): ${error.message}`,
        );

        this.applicationRepeatedEventRecorderService.record({
          entry: buildApplicationJobMemoryLimitLogEntry({
            workspaceId: workspaceEventBatch.workspaceId,
            application,
            exception: error,
          }),
          occurrenceCount: logicFunctionPayloads.length,
        });
      }
    }
  }
}
