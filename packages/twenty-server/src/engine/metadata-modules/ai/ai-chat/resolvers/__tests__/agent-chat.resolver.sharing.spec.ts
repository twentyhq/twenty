import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentChatResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/agent-chat.resolver';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AgentChatTurnPreflightService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-turn-preflight.service';

const WORKSPACE_ID = 'workspace';
const THREAD_ID = 'thread';
const VIEWER_ID = 'viewer';
const workspace = { id: WORKSPACE_ID } as never;

const buildResolver = () => {
  const threadRepository = {
    findOne: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue({ affected: 0 }),
    delete: jest.fn(),
  };
  const messages = {
    findOne: jest.fn().mockResolvedValue({ id: 'queued', threadId: THREAD_ID }),
    find: jest.fn(),
    delete: jest.fn(),
    query: jest.fn().mockResolvedValue([]),
  };
  const sharing = {
    getAuthContext: jest.fn().mockResolvedValue({ userWorkspaceId: 'owner' }),
    getReadableThread: jest
      .fn()
      .mockResolvedValue({ id: THREAD_ID, workspaceMemberId: 'owner' }),
    getThreadWithAccess: jest
      .fn()
      .mockImplementation(async ({ workspaceMemberId }) => {
        if (workspaceMemberId !== 'owner')
          throw new AiException(
            'Thread not found',
            AiExceptionCode.THREAD_NOT_FOUND,
          );
        return {
          id: THREAD_ID,
          workspaceMemberId: 'owner',
          workspaceId: WORKSPACE_ID,
        };
      }),
    getPermissions: jest
      .fn()
      .mockImplementation(async ({ workspaceMemberId }) => ({
        canRead: true,
        canUpdate: workspaceMemberId === 'owner',
        canDelete: workspaceMemberId === 'owner',
        canSoftDelete: workspaceMemberId === 'owner',
      })),
    restoreThreadWithAccess: jest
      .fn()
      .mockRejectedValue(
        new AiException('Thread not found', AiExceptionCode.THREAD_NOT_FOUND),
      ),
  };
  const recordEvents = {
    emitThreadCreated: jest.fn(),
    emitThreadUpdated: jest.fn(),
    emitThreadDestroyed: jest.fn(),
  };
  const chatService = new AgentChatService(
    threadRepository as never,
    {} as never,
    messages as never,
    {} as never,
    {} as never,
    {} as never,
    sharing as never,
    recordEvents as never,
    {} as never,
  );
  const streaming = {
    streamAgentChat: jest
      .fn()
      .mockResolvedValue({ queued: false, messageId: 'message' }),
    reapDeadStream: jest.fn().mockResolvedValue(null),
  };
  const events = {
    publish: jest.fn(),
    getAccumulatedChunks: jest
      .fn()
      .mockResolvedValue({ chunks: [], maxSeq: 0 }),
  };
  const redis = { getClient: jest.fn() };
  const threadLifecycle = new AgentChatThreadLifecycleService(
    threadRepository as never,
    redis as never,
    {} as never,
    {} as never,
    recordEvents as never,
  );
  const resolver = new AgentChatResolver(
    chatService,
    sharing as never,
    streaming as never,
    events as never,
    {} as never,
    new AgentChatTurnPreflightService(
      {
        getAvailableModels: () => ['model'],
        validateModelAvailability: jest.fn(),
      } as never,
      chatService,
      { assertAiExecutionAllowed: jest.fn() } as never,
    ),
    threadLifecycle,
  );
  return {
    resolver,
    chatService,
    threadRepository,
    messages,
    sharing,
    streaming,
    events,
    redis,
    recordEvents,
  };
};

describe('Shared conversation API boundaries', () => {
  it('does not announce a restore when the transaction rolls back', async () => {
    const context = buildResolver();
    context.threadRepository.findOne.mockResolvedValue({
      id: THREAD_ID,
      workspaceMemberId: 'owner',
      workspaceId: WORKSPACE_ID,
      deletedAt: '2026-09-01T00:00:00.000Z',
    });
    context.sharing.restoreThreadWithAccess.mockRejectedValue(
      new Error('restore failed'),
    );
    await expect(
      context.chatService.restoreThread({
        threadId: THREAD_ID,
        workspaceMemberId: 'owner',
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toThrow('restore failed');
    expect(context.recordEvents.emitThreadUpdated).not.toHaveBeenCalled();
  });

  it('restores a soft deleted conversation before sending to it', async () => {
    const { resolver, sharing, streaming, recordEvents, threadRepository } =
      buildResolver();
    const deletedThread = {
      id: THREAD_ID,
      workspaceMemberId: 'owner',
      workspaceId: WORKSPACE_ID,
      deletedAt: '2026-09-01T00:00:00.000Z',
    };
    sharing.getThreadWithAccess.mockResolvedValue(deletedThread);
    threadRepository.findOne.mockResolvedValue(deletedThread);
    sharing.restoreThreadWithAccess.mockResolvedValue({
      ...deletedThread,
      deletedAt: null,
    });
    await resolver.sendChatMessage(
      THREAD_ID,
      'Pick this back up',
      'message',
      null,
      undefined,
      null,
      VIEWER_ID,
      'member',
      workspace,
    );
    expect(sharing.restoreThreadWithAccess).toHaveBeenCalledWith({
      threadId: THREAD_ID,
      workspaceMemberId: 'member',
      workspaceId: WORKSPACE_ID,
    });
    expect(recordEvents.emitThreadUpdated).toHaveBeenCalledWith(
      expect.objectContaining({
        threadBefore: deletedThread,
        action: DatabaseEventAction.RESTORED,
      }),
    );
    expect(streaming.streamAgentChat).toHaveBeenCalled();
  });

  it('returns readable threads and catchup to viewers without granting ownership', async () => {
    const { resolver } = buildResolver();
    const thread = await resolver.chatThread(THREAD_ID, VIEWER_ID, workspace);
    expect(thread).toMatchObject({ id: THREAD_ID });
    expect(thread).not.toHaveProperty('permissions');
    await expect(
      resolver.chatStreamCatchupChunks(THREAD_ID, VIEWER_ID, workspace),
    ).resolves.toMatchObject({ chunks: [] });
  });

  it.each(['send', 'restore', 'deleteQueued'] as const)(
    'rejects %s from a viewer without mutating or executing',
    async (operation) => {
      const context = buildResolver();
      const { resolver } = context;
      const operations = {
        send: () =>
          resolver.sendChatMessage(
            THREAD_ID,
            'Execute a tool',
            'message',
            null,
            undefined,
            null,
            VIEWER_ID,
            'member',
            workspace,
          ),
        restore: () =>
          context.chatService.restoreThread({
            threadId: THREAD_ID,
            workspaceMemberId: VIEWER_ID,
            workspaceId: WORKSPACE_ID,
          }),
        deleteQueued: () =>
          resolver.deleteQueuedChatMessage('queued', VIEWER_ID, workspace),
      };
      await expect(operations[operation]()).rejects.toMatchObject({
        code: 'THREAD_NOT_FOUND',
      });
      if (operation === 'deleteQueued') {
        expect(context.sharing.getThreadWithAccess).toHaveBeenCalledWith(
          expect.objectContaining({
            workspaceMemberId: VIEWER_ID,
            operationType: 'update',
          }),
        );
      }
      expect(context.threadRepository.update).not.toHaveBeenCalled();
      expect(context.threadRepository.delete).not.toHaveBeenCalled();
      expect(context.recordEvents.emitThreadUpdated).not.toHaveBeenCalled();
      expect(context.messages.delete).not.toHaveBeenCalled();
      expect(context.streaming.streamAgentChat).not.toHaveBeenCalled();
      expect(context.events.publish).not.toHaveBeenCalled();
      expect(context.redis.getClient).not.toHaveBeenCalled();
    },
  );

  it('passes the editing participant identity to execution', async () => {
    const { resolver, sharing, streaming } = buildResolver();
    sharing.getThreadWithAccess.mockResolvedValue({
      id: THREAD_ID,
      workspaceMemberId: 'owner',
      workspaceId: WORKSPACE_ID,
    });
    await resolver.sendChatMessage(
      THREAD_ID,
      'My request',
      'message',
      null,
      undefined,
      null,
      VIEWER_ID,
      'member',
      workspace,
    );
    expect(streaming.streamAgentChat).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: THREAD_ID,
        userWorkspaceId: VIEWER_ID,
        workspaceMemberId: 'member',
        text: 'My request',
      }),
    );
  });

  it('allows an editor to remove a queued message after update authorization', async () => {
    const { resolver, sharing, messages } = buildResolver();
    sharing.getThreadWithAccess.mockResolvedValue({
      id: THREAD_ID,
      workspaceMemberId: 'owner',
      workspaceId: WORKSPACE_ID,
    });
    messages.delete.mockResolvedValue({ affected: 1 });
    await resolver.deleteQueuedChatMessage('queued', VIEWER_ID, workspace);
    expect(sharing.getThreadWithAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceMemberId: VIEWER_ID,
        operationType: 'update',
      }),
    );
    expect(messages.delete).toHaveBeenCalled();
  });

  it('does not let ownership bypass a revoked update permission', async () => {
    const { chatService, sharing } = buildResolver();
    sharing.getThreadWithAccess.mockRejectedValue(
      new AiException('Thread not found', AiExceptionCode.THREAD_NOT_FOUND),
    );
    await expect(
      chatService.getWritableThread({
        threadId: THREAD_ID,
        workspaceMemberId: 'owner',
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toMatchObject({ code: 'THREAD_NOT_FOUND' });
  });

  it('allows an authorized stop to be a no-op when the thread is idle', async () => {
    const { resolver, redis } = buildResolver();
    await expect(
      resolver.stopAgentChatStream(THREAD_ID, 'owner', workspace),
    ).resolves.toBe(true);
    expect(redis.getClient).not.toHaveBeenCalled();
  });

  it('does not cancel an owner stream when a viewer requests stop', async () => {
    const { resolver, redis, threadRepository } = buildResolver();
    await expect(
      resolver.stopAgentChatStream(THREAD_ID, VIEWER_ID, workspace),
    ).rejects.toMatchObject({ code: 'THREAD_NOT_FOUND' });
    expect(redis.getClient).not.toHaveBeenCalled();
    expect(threadRepository.update).not.toHaveBeenCalled();
  });

  it('denies hidden history to viewers even when the visible thread is shared', async () => {
    const { chatService, messages } = buildResolver();
    await expect(
      chatService.getMessagesForThread({
        threadId: THREAD_ID,
        workspaceMemberId: VIEWER_ID,
        workspaceId: WORKSPACE_ID,
        includeHidden: true,
      }),
    ).rejects.toMatchObject({ code: 'THREAD_NOT_FOUND' });
    expect(messages.find).not.toHaveBeenCalled();
  });

  it('does not read messages or catchup after access is revoked', async () => {
    const { resolver, messages, sharing, events } = buildResolver();
    sharing.getReadableThread.mockRejectedValue(new Error('access revoked'));
    await expect(
      resolver.chatMessages(THREAD_ID, VIEWER_ID, workspace),
    ).rejects.toThrow('access revoked');
    await expect(
      resolver.chatStreamCatchupChunks(THREAD_ID, VIEWER_ID, workspace),
    ).rejects.toThrow('access revoked');
    expect(messages.find).not.toHaveBeenCalled();
    expect(events.getAccumulatedChunks).not.toHaveBeenCalled();
  });
});
