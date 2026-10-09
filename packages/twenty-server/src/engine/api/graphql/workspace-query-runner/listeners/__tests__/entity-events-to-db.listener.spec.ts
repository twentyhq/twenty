import { type ObjectRecordUpsertEvent } from 'twenty-shared/database-events';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { EntityEventsToDbListener } from 'src/engine/api/graphql/workspace-query-runner/listeners/entity-events-to-db.listener';
import { type WorkspaceEventSinkService } from 'src/engine/core-modules/event-logs/ingest/workspace-event-sink.service';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CallAgentDatabaseEventTriggersJob } from 'src/engine/metadata-modules/ai/ai-agent-trigger/jobs/call-agent-database-event-triggers.job';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type ObjectRecordEventPublisher } from 'src/engine/subscriptions/object-record-event/object-record-event-publisher';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type TimelineActivityRoutingPlanService } from 'src/modules/timeline/services/timeline-activity-routing-plan.service';

const WORKSPACE_ID = 'workspace-id';

const buildFlatAgentMaps = (eventName: string) =>
  addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity: {
      id: 'agent-id',
      universalIdentifier: 'agent-id',
      workspaceId: WORKSPACE_ID,
      deletedAt: null,
      triggers: [
        {
          id: '6f1b5a3e-3c3f-4f4a-9a43-0a7f5d6c2b11',
          type: 'DATABASE_EVENT',
          isActive: true,
          instructions: null,
          settings: { eventName },
        },
      ],
    } as never,
    flatEntityMaps: createEmptyFlatEntityMaps(),
  });

const UPSERT_BATCH_EVENT = {
  name: 'company.upserted',
  workspaceId: WORKSPACE_ID,
  objectMetadata: { id: 'object-id', nameSingular: 'company' },
  events: [],
} as unknown as WorkspaceEventBatch<ObjectRecordUpsertEvent>;

const buildListener = (triggerEventName: string) => {
  const triggerQueueService = { add: jest.fn().mockResolvedValue(undefined) };
  const otherQueueService = { add: jest.fn().mockResolvedValue(undefined) };
  const flatAgentMaps = buildFlatAgentMaps(triggerEventName);

  const listener = new EntityEventsToDbListener(
    otherQueueService as unknown as MessageQueueService,
    otherQueueService as unknown as MessageQueueService,
    otherQueueService as unknown as MessageQueueService,
    triggerQueueService as unknown as MessageQueueService,
    { publish: jest.fn() } as unknown as ObjectRecordEventPublisher,
    {} as TimelineActivityRoutingPlanService,
    {
      getOrRecompute: jest.fn().mockResolvedValue({ flatAgentMaps }),
    } as unknown as WorkspaceCacheService,
    { isEnabled: () => true } as unknown as WorkspaceEventSinkService,
  );

  return { listener, triggerQueueService, otherQueueService };
};

describe('EntityEventsToDbListener', () => {
  it('should dispatch upsert events to agents watching them', async () => {
    const { listener, triggerQueueService, otherQueueService } =
      buildListener('company.upserted');

    await listener.handleUpsert(UPSERT_BATCH_EVENT);

    expect(triggerQueueService.add).toHaveBeenCalledWith(
      CallAgentDatabaseEventTriggersJob.name,
      UPSERT_BATCH_EVENT,
      { retryLimit: 3 },
    );
    expect(otherQueueService.add).not.toHaveBeenCalled();
  });

  it('should not dispatch timeline activity upserts', async () => {
    const { listener, triggerQueueService } = buildListener(
      'timelineActivity.upserted',
    );

    await listener.handleUpsert({
      ...UPSERT_BATCH_EVENT,
      name: 'timelineActivity.upserted',
      objectMetadata: {
        id: 'object-id',
        nameSingular: 'timelineActivity',
        universalIdentifier:
          STANDARD_OBJECTS.timelineActivity.universalIdentifier,
      },
    } as unknown as WorkspaceEventBatch<ObjectRecordUpsertEvent>);

    expect(triggerQueueService.add).not.toHaveBeenCalled();
  });

  it('should not dispatch upsert events when no agent watches them', async () => {
    const { listener, triggerQueueService } = buildListener('company.created');

    await listener.handleUpsert(UPSERT_BATCH_EVENT);

    expect(triggerQueueService.add).not.toHaveBeenCalled();
  });
});
