import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';

const OBJECT_METADATA = {
  id: 'agent-chat-thread-object-id',
  nameSingular: 'agentChatThread',
  universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
  fieldIds: [],
};

const buildThread = (
  overrides: Partial<AgentChatThreadWorkspaceEntity> = {},
): AgentChatThreadWorkspaceEntity =>
  ({
    id: THREAD_ID,
    title: 'Pipeline review',
    updatedAt: '2026-09-29T10:00:00.000Z',
    ...overrides,
  }) as AgentChatThreadWorkspaceEntity;

const buildService = ({
  storedThread = buildThread() as AgentChatThreadWorkspaceEntity | null,
  hasThreadObject = true,
} = {}) => {
  const threadRepository = {
    findOne: jest.fn().mockResolvedValue(storedThread),
  };
  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatObjectMetadataMaps: {
        byUniversalIdentifier: hasThreadObject
          ? { [OBJECT_METADATA.universalIdentifier]: OBJECT_METADATA }
          : {},
      },
      flatFieldMetadataMaps: {
        byId: {},
        byUniversalIdentifier: {},
        universalIdentifierById: {},
        universalIdentifiersByApplicationId: {},
      },
    }),
  };
  const workspaceEventEmitter = { emitDatabaseBatchEvent: jest.fn() };

  const service = new AgentChatThreadRecordEventService(
    threadRepository as never,
    workspaceCacheService as never,
    workspaceEventEmitter as never,
  );

  return { service, workspaceEventEmitter };
};

describe('AgentChatThreadRecordEventService', () => {
  it('announces a thread created outside the record API', async () => {
    const { service, workspaceEventEmitter } = buildService();

    await service.emitThreadCreated({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
    });

    expect(workspaceEventEmitter.emitDatabaseBatchEvent).toHaveBeenCalledWith({
      objectMetadataNameSingular: 'agentChatThread',
      action: DatabaseEventAction.CREATED,
      events: [
        expect.objectContaining({
          recordId: THREAD_ID,
          properties: { after: buildThread() },
        }),
      ],
      objectMetadata: OBJECT_METADATA,
      workspaceId: WORKSPACE_ID,
    });
  });

  it('announces the stored thread with the fields its writer changed', async () => {
    const { service, workspaceEventEmitter } = buildService({
      storedThread: buildThread({ title: 'Renamed' }),
    });

    await service.emitThreadUpdated({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
      updatedFields: ['title', 'updatedAt'],
      threadBefore: buildThread(),
    });

    const [{ action, events }] =
      workspaceEventEmitter.emitDatabaseBatchEvent.mock.calls[0];

    expect(action).toBe(DatabaseEventAction.UPDATED);
    expect(events).toEqual([
      expect.objectContaining({
        recordId: THREAD_ID,
        properties: expect.objectContaining({
          before: buildThread(),
          after: buildThread({ title: 'Renamed' }),
          updatedFields: ['title', 'updatedAt'],
          diff: { title: { before: 'Pipeline review', after: 'Renamed' } },
        }),
      }),
    ]);
  });

  it('announces a thread destroyed outside the record API with its last state', async () => {
    const { service, workspaceEventEmitter } = buildService();

    await service.emitThreadDestroyed({
      workspaceId: WORKSPACE_ID,
      threadBefore: buildThread(),
    });

    expect(workspaceEventEmitter.emitDatabaseBatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: DatabaseEventAction.DESTROYED,
        events: [
          expect.objectContaining({
            recordId: THREAD_ID,
            properties: { before: buildThread() },
          }),
        ],
      }),
    );
  });

  it('stays silent when the thread is gone or the object is not provisioned', async () => {
    const missingThread = buildService({ storedThread: null });
    const missingObject = buildService({ hasThreadObject: false });

    await missingThread.service.emitThreadUpdated({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
      updatedFields: ['title'],
    });
    await missingObject.service.emitThreadCreated({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
    });

    expect(
      missingThread.workspaceEventEmitter.emitDatabaseBatchEvent,
    ).not.toHaveBeenCalled();
    expect(
      missingObject.workspaceEventEmitter.emitDatabaseBatchEvent,
    ).not.toHaveBeenCalled();
  });
});
