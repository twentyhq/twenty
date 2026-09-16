import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

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
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { buildRoleRowAccessPolicySubject } from 'src/engine/core-modules/record-share/utils/build-role-row-access-policy-subject.util';
import { omitRestrictedFieldsFromEvent } from 'src/engine/core-modules/record-share/utils/omit-restricted-fields-from-event.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

// An update left with no visible field would only reveal that a hidden one changed
const isUpdateOfHiddenFieldsOnly = (event: ObjectRecordEvent): boolean => {
  const { updatedFields } = event.properties as { updatedFields?: string[] };

  return isDefined(updatedFields) && updatedFields.length === 0;
};

@Processor(MessageQueue.triggerQueue)
export class CallDatabaseEventTriggerJobsJob {
  private readonly logger = new Logger(CallDatabaseEventTriggerJobsJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationJobEnqueueThrottlerService: ApplicationJobEnqueueThrottlerService,
    private readonly recordAccessPolicyService: RecordAccessPolicyService,
  ) {}

  @Process(CallDatabaseEventTriggerJobsJob.name)
  async handle(workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>) {
    const {
      flatLogicFunctionMaps,
      flatApplicationMaps,
      rolesPermissions,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(
      workspaceEventBatch.workspaceId,
      [
        'flatLogicFunctionMaps',
        'flatApplicationMaps',
        'rolesPermissions',
        'flatRowLevelPermissionPredicateMaps',
        'flatRowLevelPermissionPredicateGroupMaps',
        'flatFieldMetadataMaps',
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

    const eventRecordAccessGate =
      this.recordAccessPolicyService.buildEventRecordAccessGate(
        workspaceEventBatch,
      );

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

      const applicationRoleId = application.defaultRoleId;
      const applicationObjectsPermissions = isDefined(applicationRoleId)
        ? rolesPermissions[applicationRoleId]
        : undefined;

      // An application receives what its role lets it read, as through the
      // API: without a role it reads nothing.
      if (
        !isDefined(applicationRoleId) ||
        !isDefined(applicationObjectsPermissions)
      ) {
        continue;
      }

      const admittedRecordIds =
        await eventRecordAccessGate.resolveAdmittedRecordIds(
          buildRoleRowAccessPolicySubject({
            roleId: applicationRoleId,
            owningApplicationId: application.id,
            rolesPermissions,
            flatRowLevelPermissionPredicateMaps,
            flatRowLevelPermissionPredicateGroupMaps,
            flatFieldMetadataMaps,
          }),
        );
      const restrictedFields =
        applicationObjectsPermissions[workspaceEventBatch.objectMetadata.id]
          ?.restrictedFields;
      const admittedEvents = workspaceEventBatch.events
        .filter((event) => admittedRecordIds.has(event.recordId))
        .map((event) =>
          omitRestrictedFieldsFromEvent({
            event,
            restrictedFields,
            flatFieldMetadataMaps,
          }),
        )
        .filter((event) => !isUpdateOfHiddenFieldsOnly(event));
      const logicFunctionPayloads = transformEventBatchToEventPayloads({
        logicFunctions,
        workspaceEventBatch: {
          ...workspaceEventBatch,
          events: admittedEvents,
        },
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
