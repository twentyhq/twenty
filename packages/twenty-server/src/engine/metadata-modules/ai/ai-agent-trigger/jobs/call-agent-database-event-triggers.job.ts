import { Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { buildRoleRowAccessPolicySubject } from 'src/engine/core-modules/record-share/utils/build-role-row-access-policy-subject.util';
import { isUpdateOfHiddenFieldsOnly } from 'src/engine/core-modules/record-share/utils/is-update-of-hidden-fields-only.util';
import { omitInheritedReadabilityChildRecords } from 'src/engine/core-modules/record-share/utils/omit-inherited-readability-child-records.util';
import { omitRestrictedFieldsFromEvent } from 'src/engine/core-modules/record-share/utils/omit-restricted-fields-from-event.util';
import { AGENT_TRIGGER_RUN_LIMITS } from 'src/engine/metadata-modules/ai/ai-agent-trigger/constants/agent-trigger-run-limits.const';
import { RunAgentTriggerJob } from 'src/engine/metadata-modules/ai/ai-agent-trigger/jobs/run-agent-trigger.job';
import { AgentTriggerThrottlerService } from 'src/engine/metadata-modules/ai/ai-agent-trigger/services/agent-trigger-throttler.service';
import { type RunAgentTriggerJobData } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/run-agent-trigger-job-data.type';
import { findAgentDatabaseEventTriggersMatchingEvent } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/find-agent-database-event-triggers-matching-event.util';
import { isDatabaseEventCausedByAgent } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/is-database-event-caused-by-agent.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { selectEventsForDatabaseEventTrigger } from 'src/engine/workspace-event-emitter/utils/select-events-for-database-event-trigger.util';

@Processor(MessageQueue.triggerQueue)
export class CallAgentDatabaseEventTriggersJob {
  private readonly logger = new Logger(CallAgentDatabaseEventTriggersJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordAccessPolicyService: RecordAccessPolicyService,
    private readonly agentTriggerThrottlerService: AgentTriggerThrottlerService,
  ) {}

  @Process(CallAgentDatabaseEventTriggersJob.name)
  async handle(workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>) {
    const {
      workspaceId,
      name: eventName,
      objectMetadata,
    } = workspaceEventBatch;

    const {
      flatAgentMaps,
      flatRoleTargetByAgentIdMaps,
      rolesPermissions,
      roleIdsWithAllRecordsAccess,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatAgentMaps',
      'flatRoleTargetByAgentIdMaps',
      'rolesPermissions',
      'roleIdsWithAllRecordsAccess',
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
      'flatFieldMetadataMaps',
    ]);

    const matchingAgentTriggers = findAgentDatabaseEventTriggersMatchingEvent({
      flatAgentMaps,
      eventName,
    });

    if (matchingAgentTriggers.length === 0) {
      return;
    }

    const eventRecordAccessGate =
      this.recordAccessPolicyService.buildEventRecordAccessGate(
        workspaceEventBatch,
      );

    for (const { flatAgent, trigger } of matchingAgentTriggers) {
      const agentRoleId = flatRoleTargetByAgentIdMaps[flatAgent.id]?.roleId;
      const agentObjectsPermissions = isDefined(agentRoleId)
        ? rolesPermissions[agentRoleId]
        : undefined;

      // An agent receives what its role lets it read: without a role it reads nothing
      if (!isDefined(agentRoleId) || !isDefined(agentObjectsPermissions)) {
        continue;
      }

      const admittedRecordIds =
        await eventRecordAccessGate.resolveAdmittedRecordIds(
          buildRoleRowAccessPolicySubject({
            roleId: agentRoleId,
            owningApplicationId: flatAgent.applicationId,
            rolesPermissions,
            roleIdsWithAllRecordsAccess,
            flatRowLevelPermissionPredicateMaps,
            flatRowLevelPermissionPredicateGroupMaps,
            flatFieldMetadataMaps,
          }),
        );
      const restrictedFields =
        agentObjectsPermissions[objectMetadata.id]?.restrictedFields;

      const admittedEvents = workspaceEventBatch.events
        .filter((event) => admittedRecordIds.has(event.recordId))
        .filter(
          (event) =>
            !isDatabaseEventCausedByAgent({
              event,
              eventName,
              agentId: flatAgent.id,
            }),
        )
        .map((event) =>
          omitInheritedReadabilityChildRecords(
            omitRestrictedFieldsFromEvent({
              event,
              restrictedFields,
              flatFieldMetadataMaps,
            }),
          ),
        )
        .filter((event) => !isUpdateOfHiddenFieldsOnly(event));

      const eventsToRunOn = selectEventsForDatabaseEventTrigger({
        events: admittedEvents,
        eventName,
        actor: workspaceEventBatch.actor,
        triggerSettings: trigger.settings,
      });

      if (eventsToRunOn.length === 0) {
        continue;
      }

      const eventGroups = trigger.settings.batchMode
        ? chunk(
            eventsToRunOn,
            AGENT_TRIGGER_RUN_LIMITS.MAX_EVENTS_PER_BATCHED_RUN,
          )
        : eventsToRunOn.map((event) => [event]);

      const grantedRunCount =
        await this.agentTriggerThrottlerService.consumeAvailableRuns({
          workspaceId,
          agentId: flatAgent.id,
          requestedRunCount: eventGroups.length,
        });

      if (grantedRunCount < eventGroups.length) {
        this.logger.warn(
          `Run limit reached for agent ${flatAgent.id} in workspace ${workspaceId}: skipping ${eventGroups.length - grantedRunCount} run(s) of trigger ${trigger.id}`,
        );
      }

      if (grantedRunCount === 0) {
        continue;
      }

      await this.messageQueueService.bulkAdd<RunAgentTriggerJobData>(
        RunAgentTriggerJob.name,
        eventGroups.slice(0, grantedRunCount).map((events) => ({
          data: {
            workspaceId,
            agentId: flatAgent.id,
            triggerId: trigger.id,
            dispatchedRoleId: agentRoleId,
            payload: {
              type: 'DATABASE_EVENT',
              eventName,
              objectNameSingular: objectMetadata.nameSingular,
              events,
            },
          },
        })),
      );
    }
  }
}
