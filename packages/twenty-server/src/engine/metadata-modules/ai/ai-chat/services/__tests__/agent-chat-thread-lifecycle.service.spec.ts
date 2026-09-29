import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { In, IsNull, Not } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { LEGACY_CHAT_THREAD_OWNER_FIELD_UNIVERSAL_IDENTIFIER } from 'src/engine/metadata-modules/ai/ai-chat/constants/legacy-chat-thread-owner-field-universal-identifier.constant';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { getCancelChannel } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-cancel-channel.util';

const WORKSPACE_ID = 'workspace-id';
const OBJECT_METADATA_ID = 'agent-chat-thread-object-id';
const WORKSPACE_MEMBER_ID = 'workspace-member-id';
const USER_WORKSPACE_ID = 'user-workspace-id';

const buildUserAuthContext = () =>
  ({
    type: 'user',
    workspace: { id: WORKSPACE_ID },
    workspaceMemberId: WORKSPACE_MEMBER_ID,
    userWorkspaceId: USER_WORKSPACE_ID,
  }) as unknown as WorkspaceAuthContext;

const buildService = ({
  storedThreads = [] as { id: string; activeStreamId: string | null }[],
  fieldUniversalIdentifiers = [] as string[],
  updatedThreadIds = [] as string[],
} = {}) => {
  const threadRepository = {
    find: jest.fn().mockResolvedValue(storedThreads),
    findOne: jest.fn().mockResolvedValue(storedThreads[0] ?? null),
    update: jest.fn().mockResolvedValue({
      affected: updatedThreadIds.length,
      generatedMaps: updatedThreadIds.map((id) => ({ id })),
    }),
  };
  const redisClient = { publish: jest.fn().mockResolvedValue(1) };
  const codeInterpreterService = {
    releaseThreadSandbox: jest.fn().mockResolvedValue(undefined),
  };
  const recordShareStorageService = {
    deleteByRecordIds: jest.fn().mockResolvedValue(undefined),
  };
  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          [STANDARD_OBJECTS.agentChatThread.universalIdentifier]: {
            id: OBJECT_METADATA_ID,
          },
        },
      },
      flatFieldMetadataMaps: {
        byUniversalIdentifier: Object.fromEntries(
          fieldUniversalIdentifiers.map((universalIdentifier) => [
            universalIdentifier,
            { universalIdentifier },
          ]),
        ),
      },
    }),
  };
  const threadRecordEventService = {
    emitThreadUpdated: jest.fn().mockResolvedValue(undefined),
  };

  const service = new AgentChatThreadLifecycleService(
    threadRepository as never,
    { getClient: () => redisClient } as never,
    codeInterpreterService as never,
    recordShareStorageService as never,
    workspaceCacheService as never,
    threadRecordEventService as never,
  );

  return {
    service,
    threadRepository,
    redisClient,
    codeInterpreterService,
    recordShareStorageService,
    threadRecordEventService,
  };
};

describe('AgentChatThreadLifecycleService', () => {
  describe('cancelActiveStreamIfAny', () => {
    it('publishes a cancel for the stream the thread is running', async () => {
      const { service, redisClient } = buildService({
        storedThreads: [{ id: 'thread', activeStreamId: 'stream' }],
      });

      await service.cancelActiveStreamIfAny({
        workspaceId: WORKSPACE_ID,
        threadId: 'thread',
      });

      expect(redisClient.publish).toHaveBeenCalledWith(
        getCancelChannel('thread', 'stream'),
        'cancel',
      );
    });

    it('does nothing when the thread is idle', async () => {
      const { service, redisClient } = buildService({
        storedThreads: [{ id: 'thread', activeStreamId: null }],
      });

      await service.cancelActiveStreamIfAny({
        workspaceId: WORKSPACE_ID,
        threadId: 'thread',
      });

      expect(redisClient.publish).not.toHaveBeenCalled();
    });
  });

  describe('stopArchivedThreads', () => {
    it('stops the running stream and releases the sandbox of each archived thread', async () => {
      const {
        service,
        threadRepository,
        redisClient,
        codeInterpreterService,
        threadRecordEventService,
      } = buildService({
        storedThreads: [
          { id: 'streaming', activeStreamId: 'stream' },
          { id: 'idle', activeStreamId: null },
        ],
        updatedThreadIds: ['streaming'],
      });

      await service.stopArchivedThreads({
        workspaceId: WORKSPACE_ID,
        threadIds: ['streaming', 'idle', 'not-archived'],
      });

      expect(threadRepository.find).toHaveBeenCalledWith(WORKSPACE_ID, {
        where: {
          id: In(['streaming', 'idle', 'not-archived']),
          archivedAt: Not(IsNull()),
        },
      });
      expect(redisClient.publish).toHaveBeenCalledTimes(1);
      expect(redisClient.publish).toHaveBeenCalledWith(
        getCancelChannel('streaming', 'stream'),
        'cancel',
      );
      expect(threadRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: 'streaming', activeStreamId: 'stream' },
        { activeStreamId: null },
      );
      expect(threadRecordEventService.emitThreadUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ threadId: 'streaming' }),
      );
      expect(codeInterpreterService.releaseThreadSandbox).toHaveBeenCalledWith(
        WORKSPACE_ID,
        'streaming',
      );
      expect(codeInterpreterService.releaseThreadSandbox).toHaveBeenCalledWith(
        WORKSPACE_ID,
        'idle',
      );
      expect(codeInterpreterService.releaseThreadSandbox).toHaveBeenCalledTimes(
        2,
      );
    });

    it('reads nothing when no thread was updated', async () => {
      const { service, threadRepository } = buildService();

      await service.stopArchivedThreads({
        workspaceId: WORKSPACE_ID,
        threadIds: [],
      });

      expect(threadRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('cleanUpDestroyedThreads', () => {
    it('releases sandboxes and deletes the sharing grants of destroyed threads', async () => {
      const { service, codeInterpreterService, recordShareStorageService } =
        buildService();

      await service.cleanUpDestroyedThreads({
        workspaceId: WORKSPACE_ID,
        threadIds: ['first', 'second'],
      });

      expect(codeInterpreterService.releaseThreadSandbox).toHaveBeenCalledWith(
        WORKSPACE_ID,
        'first',
      );
      expect(codeInterpreterService.releaseThreadSandbox).toHaveBeenCalledWith(
        WORKSPACE_ID,
        'second',
      );
      expect(recordShareStorageService.deleteByRecordIds).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        objectMetadataId: OBJECT_METADATA_ID,
        recordIds: ['first', 'second'],
      });
    });
  });

  describe('assignCreatedThreadsToCreator', () => {
    it('makes the creating member the owner of unowned threads outside workflow runs', async () => {
      const { service, threadRepository, threadRecordEventService } =
        buildService({
          fieldUniversalIdentifiers: [
            STANDARD_OBJECTS.agentChatThread.fields.workflowRun
              .universalIdentifier,
          ],
          updatedThreadIds: ['created'],
        });

      await service.assignCreatedThreadsToCreator({
        authContext: buildUserAuthContext(),
        threadIds: ['created'],
      });

      expect(threadRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        {
          id: In(['created']),
          workspaceMemberId: IsNull(),
          workflowRunId: IsNull(),
        },
        { workspaceMemberId: WORKSPACE_MEMBER_ID },
      );
      expect(threadRecordEventService.emitThreadUpdated).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        threadId: 'created',
        updatedFields: ['workspaceMember', 'workspaceMemberId'],
      });
    });

    it('also writes the legacy owner column while the workspace still has it', async () => {
      const { service, threadRepository } = buildService({
        fieldUniversalIdentifiers: [
          LEGACY_CHAT_THREAD_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
        ],
        updatedThreadIds: ['created'],
      });

      await service.assignCreatedThreadsToCreator({
        authContext: buildUserAuthContext(),
        threadIds: ['created'],
      });

      expect(threadRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: In(['created']), workspaceMemberId: IsNull() },
        {
          workspaceMemberId: WORKSPACE_MEMBER_ID,
          userWorkspaceId: USER_WORKSPACE_ID,
        },
      );
    });

    it('leaves threads created by an API key or an application unowned', async () => {
      const { service, threadRepository } = buildService();

      await service.assignCreatedThreadsToCreator({
        authContext: {
          type: 'apiKey',
          workspace: { id: WORKSPACE_ID },
        } as unknown as WorkspaceAuthContext,
        threadIds: ['created'],
      });

      expect(threadRepository.update).not.toHaveBeenCalled();
    });
  });
});
