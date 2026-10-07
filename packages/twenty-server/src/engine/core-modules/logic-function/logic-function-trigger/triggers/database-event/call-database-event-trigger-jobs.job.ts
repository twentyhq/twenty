import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';
import type { DatabaseEventTriggerSettings } from 'twenty-shared/application';

import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ApplicationJobEnqueueThrottlerService } from 'src/engine/core-modules/message-queue/services/application-job-enqueue-throttler.service';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-queue-retry-backoff.constant';
import { DeferredDatabaseEventTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/services/deferred-database-event-trigger.service';
import {
  collectSignalNamesFromConditions,
  evaluateDatabaseEventTriggerSignalConditions,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/evaluate-database-event-trigger-signal-conditions.util';
import { findLogicFunctionsTriggeredByEventName } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/find-logic-functions-triggered-by-event-name';
import { transformEventBatchToEventPayloads } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/transform-event-batch-to-event-payloads';
import {
  LogicFunctionTriggerJob,
  LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { buildRoleRowAccessPolicySubject } from 'src/engine/core-modules/record-share/utils/build-role-row-access-policy-subject.util';
import { isUpdateOfHiddenFieldsOnly } from 'src/engine/core-modules/record-share/utils/is-update-of-hidden-fields-only.util';
import { omitRestrictedFieldsFromEvent } from 'src/engine/core-modules/record-share/utils/omit-restricted-fields-from-event.util';
import {
  WorkspaceSignalService,
  type WorkspaceSignalStates,
} from 'src/engine/core-modules/workspace-signal/services/workspace-signal.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { selectEventsForDatabaseEventTrigger } from 'src/engine/workspace-event-emitter/utils/select-events-for-database-event-trigger.util';

@Processor(MessageQueue.triggerQueue)
export class CallDatabaseEventTriggerJobsJob {
  private readonly logger = new Logger(CallDatabaseEventTriggerJobsJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationJobEnqueueThrottlerService: ApplicationJobEnqueueThrottlerService,
    private readonly recordAccessPolicyService: RecordAccessPolicyService,
    private readonly workspaceSignalService: WorkspaceSignalService,
    private readonly deferredDatabaseEventTriggerService: DeferredDatabaseEventTriggerService,
  ) {}

  @Process(CallDatabaseEventTriggerJobsJob.name)
  async handle(workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>) {
    const {
      flatLogicFunctionMaps,
      flatApplicationMaps,
      rolesPermissions,
      roleIdsWithAllRecordsAccess,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(
      workspaceEventBatch.workspaceId,
      [
        'flatLogicFunctionMaps',
        'flatApplicationMaps',
        'rolesPermissions',
        'roleIdsWithAllRecordsAccess',
        'flatRowLevelPermissionPredicateMaps',
        'flatRowLevelPermissionPredicateGroupMaps',
        'flatFieldMetadataMaps',
      ],
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

    const signalStates = await this.readSignalStates({
      workspaceId: workspaceEventBatch.workspaceId,
      logicFunctions: logicFunctionsToTrigger,
    });

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
            roleIdsWithAllRecordsAccess,
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
      const admittedWorkspaceEventBatch = {
        ...workspaceEventBatch,
        events: admittedEvents,
      };
      const logicFunctionsToDeliver = await this.dropOrDeferOnSignalMismatch({
        logicFunctions,
        workspaceEventBatch: admittedWorkspaceEventBatch,
        signalStates,
      });
      const logicFunctionPayloads = transformEventBatchToEventPayloads({
        logicFunctions: logicFunctionsToDeliver,
        workspaceEventBatch: admittedWorkspaceEventBatch,
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

  private async readSignalStates({
    workspaceId,
    logicFunctions,
  }: {
    workspaceId: string;
    logicFunctions: {
      databaseEventTriggerSettings: DatabaseEventTriggerSettings | null;
    }[];
  }): Promise<WorkspaceSignalStates> {
    const signalNames = collectSignalNamesFromConditions(
      logicFunctions.map(
        (logicFunction) =>
          logicFunction.databaseEventTriggerSettings?.conditions?.signals,
      ),
    );

    if (signalNames.length === 0) {
      return {};
    }

    return this.workspaceSignalService.read({
      workspaceId,
      names: signalNames,
    });
  }

  private async dropOrDeferOnSignalMismatch<
    TLogicFunction extends Pick<
      LogicFunctionEntity,
      'id' | 'databaseEventTriggerSettings'
    >,
  >({
    logicFunctions,
    workspaceEventBatch,
    signalStates,
  }: {
    logicFunctions: TLogicFunction[];
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
    signalStates: WorkspaceSignalStates;
  }): Promise<TLogicFunction[]> {
    const logicFunctionsToDeliver: TLogicFunction[] = [];

    for (const logicFunction of logicFunctions) {
      const conditions = logicFunction.databaseEventTriggerSettings?.conditions;
      const evaluation = evaluateDatabaseEventTriggerSignalConditions({
        signalConditions: conditions?.signals,
        signalStates,
      });

      if (evaluation.matches) {
        logicFunctionsToDeliver.push(logicFunction);
        continue;
      }

      if (conditions?.onMismatch !== 'deferUntilMatch') {
        continue;
      }

      const droppedEventCount = selectEventsForDatabaseEventTrigger({
        events: workspaceEventBatch.events,
        eventName: workspaceEventBatch.name,
        actor: workspaceEventBatch.actor,
        triggerSettings: logicFunction.databaseEventTriggerSettings,
      }).length;

      if (droppedEventCount === 0) {
        continue;
      }

      await this.deferredDatabaseEventTriggerService.defer({
        workspaceId: workspaceEventBatch.workspaceId,
        signal: evaluation.mismatchedSignal,
        logicFunctionId: logicFunction.id,
        droppedEventCount,
      });
    }

    return logicFunctionsToDeliver;
  }
}
