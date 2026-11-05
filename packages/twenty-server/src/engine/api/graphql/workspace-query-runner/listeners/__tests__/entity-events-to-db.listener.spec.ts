import { Test } from '@nestjs/testing';

import { type ObjectRecordUpsertEvent } from 'twenty-shared/database-events';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { EntityEventsToDbListener } from 'src/engine/api/graphql/workspace-query-runner/listeners/entity-events-to-db.listener';
import { WorkspaceEventSinkService } from 'src/engine/core-modules/event-logs/ingest/workspace-event-sink.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { CallAgentDatabaseEventTriggersJob } from 'src/engine/metadata-modules/ai/ai-agent-trigger/jobs/call-agent-database-event-triggers.job';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { ObjectRecordEventPublisher } from 'src/engine/subscriptions/object-record-event/object-record-event-publisher';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { TimelineActivityRoutingPlanService } from 'src/modules/timeline/services/timeline-activity-routing-plan.service';

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

const UPSERT_BATCH_EVENT: WorkspaceEventBatch<ObjectRecordUpsertEvent> = {
  name: 'company.upserted',
  workspaceId: WORKSPACE_ID,
  objectMetadata: getFlatObjectMetadataMock({
    id: 'object-id',
    universalIdentifier: 'object-id',
    nameSingular: 'company',
  }),
  events: [],
};

const buildListener = async (triggerEventName: string) => {
  const triggerQueueService = { add: jest.fn().mockResolvedValue(undefined) };
  const otherQueueService = { add: jest.fn().mockResolvedValue(undefined) };
  const flatAgentMaps = buildFlatAgentMaps(triggerEventName);

  const module = await Test.createTestingModule({
    providers: [
      EntityEventsToDbListener,
      {
        provide: getQueueToken(MessageQueue.entityEventsToDbQueue),
        useValue: otherQueueService,
      },
      {
        provide: getQueueToken(MessageQueue.eventLogQueue),
        useValue: otherQueueService,
      },
      {
        provide: getQueueToken(MessageQueue.webhookQueue),
        useValue: otherQueueService,
      },
      {
        provide: getQueueToken(MessageQueue.triggerQueue),
        useValue: triggerQueueService,
      },
      {
        provide: ObjectRecordEventPublisher,
        useValue: { publish: jest.fn() },
      },
      { provide: TimelineActivityRoutingPlanService, useValue: {} },
      {
        provide: WorkspaceCacheService,
        useValue: {
          getOrRecompute: jest.fn().mockResolvedValue({ flatAgentMaps }),
        },
      },
      {
        provide: WorkspaceEventSinkService,
        useValue: { isEnabled: () => true },
      },
    ],
  }).compile();

  return {
    listener: module.get(EntityEventsToDbListener),
    triggerQueueService,
    otherQueueService,
  };
};

describe('EntityEventsToDbListener', () => {
  it('should dispatch upsert events to agents watching them', async () => {
    const { listener, triggerQueueService, otherQueueService } =
      await buildListener('company.upserted');

    await listener.handleUpsert(UPSERT_BATCH_EVENT);

    expect(triggerQueueService.add).toHaveBeenCalledWith(
      CallAgentDatabaseEventTriggersJob.name,
      UPSERT_BATCH_EVENT,
      {
        retryLimit: 3,
        workspaceId: UPSERT_BATCH_EVENT.workspaceId,
        isWorkspaceJob: true,
      },
    );
    expect(otherQueueService.add).not.toHaveBeenCalled();
  });

  it('should not dispatch timeline activity upserts', async () => {
    const { listener, triggerQueueService } = await buildListener(
      'timelineActivity.upserted',
    );

    await listener.handleUpsert({
      ...UPSERT_BATCH_EVENT,
      name: 'timelineActivity.upserted',
      objectMetadata: getFlatObjectMetadataMock({
        id: 'object-id',
        nameSingular: 'timelineActivity',
        universalIdentifier:
          STANDARD_OBJECTS.timelineActivity.universalIdentifier,
      }),
    });

    expect(triggerQueueService.add).not.toHaveBeenCalled();
  });

  it('should not dispatch upsert events when no agent watches them', async () => {
    const { listener, triggerQueueService } =
      await buildListener('company.created');

    await listener.handleUpsert(UPSERT_BATCH_EVENT);

    expect(triggerQueueService.add).not.toHaveBeenCalled();
  });
});
