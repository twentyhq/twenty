import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RecordAccessPolicyService } from 'src/engine/permissions/combine/services/record-access-policy.service';
import { isUpdateOfHiddenFieldsOnly } from 'src/engine/permissions/masking/utils/is-update-of-hidden-fields-only.util';
import { omitRestrictedFieldsFromEvent } from 'src/engine/permissions/masking/utils/omit-restricted-fields-from-event.util';
import { AGENT_TRIGGER_RUN_LIMITS } from 'src/engine/metadata-modules/ai/ai-agent-trigger/constants/agent-trigger-run-limits.const';
import { RunAgentTriggerJob } from 'src/engine/metadata-modules/ai/ai-agent-trigger/jobs/run-agent-trigger.job';
import { AgentTriggerThrottlerService } from 'src/engine/metadata-modules/ai/ai-agent-trigger/services/agent-trigger-throttler.service';
import { type RunAgentTriggerJobData } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/run-agent-trigger-job-data.type';
import { findAgentDatabaseEventTriggersMatchingEvent } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/find-agent-database-event-triggers-matching-event.util';
import { isDatabaseEventCausedByAgent } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/is-database-event-caused-by-agent.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { filterEventsByUpdatedFields } from 'src/engine/workspace-event-emitter/utils/filter-events-by-updated-fields.util';

@Processor(MessageQueue.triggerQueue)
export class CallAgentDatabaseEventTriggersJob {
  private readonly logger = new Logger(CallAgentDatabaseEventTriggersJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordAccessPolicyService: RecordAccessPolicyService,
    private readonly agentTriggerThrottlerService: AgentTriggerThrottlerService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
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
      flatApplicationMaps,
      flatRoleTargetByAgentIdMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatAgentMaps',
      'flatApplicationMaps',
      'flatRoleTargetByAgentIdMaps',
      'flatFieldMetadataMaps',
      'flatObjectMetadataMaps',
    ]);

    const matchingAgentTriggers = findAgentDatabaseEventTriggersMatchingEvent({
      flatAgentMaps,
      eventName,
    });

    if (matchingAgentTriggers.length === 0) {
      return;
    }

    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspaceId,
    );

    if (!isDefined(workspace)) {
      this.logger.warn(
        `Workspace ${workspaceId} not found, skipping agent triggers for ${eventName}`,
      );

      return;
    }

    const eventRecordAccessGate =
      this.recordAccessPolicyService.buildEventRecordAccessGate(
        workspaceEventBatch,
      );

    for (const { flatAgent, trigger } of matchingAgentTriggers) {
      const application = flatApplicationMaps.byId[flatAgent.applicationId];

      if (!isDefined(application) || isDefined(application.deletedAt)) {
        continue;
      }

      const agentAuthContext = buildApplicationAuthContext({
        workspace,
        application,
        agentId: flatAgent.id,
      });
      const agentObjectsPermissions =
        await this.recordAccessPolicyService.findObjectsPermissions(
          agentAuthContext,
        );

      if (!isDefined(agentObjectsPermissions)) {
        continue;
      }

      const admittedRecordIds =
        await eventRecordAccessGate.resolveAdmittedRecordIds(agentAuthContext);
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
          omitRestrictedFieldsFromEvent({
            event,
            objectMetadata,
            objectsPermissions: agentObjectsPermissions,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
          }),
        )
        .filter((event) => !isUpdateOfHiddenFieldsOnly(event));

      const eventsToRunOn = filterEventsByUpdatedFields({
        events: admittedEvents,
        eventName,
        watchedFields: trigger.settings.updatedFields,
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
            dispatchedRoleId: flatRoleTargetByAgentIdMaps[flatAgent.id]?.roleId,
            payload: {
              type: 'DATABASE_EVENT',
              eventName,
              objectNameSingular: objectMetadata.nameSingular,
              events,
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            flatAgent.applicationUniversalIdentifier,
        })),
      );
    }
  }
}
