import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentChatResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/agent-chat.resolver';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentChatTurnPreflightService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-turn-preflight.service';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

const WORKSPACE_ID = 'workspace';
const THREAD_ID = 'thread';
const VIEWER_ID = 'viewer';
const workspace = { id: WORKSPACE_ID } as never;

const buildResolver = () => {
  const threadRepository = {
    existsBy: jest.fn().mockResolvedValue(true),
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
    createThread: jest.fn().mockResolvedValue({ id: THREAD_ID }),
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
    restoreThreadWithAccess: jest
      .fn()
      .mockRejectedValue(
        new AiException('Thread not found', AiExceptionCode.THREAD_NOT_FOUND),
      ),
  };
  const recordEvents = { emit: jest.fn() };
  const threadService = new AgentChatThreadService(
    threadRepository as never,
    sharing as never,
    recordEvents as never,
    {
      recordMemberActivity: jest.fn().mockResolvedValue({
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      }),
    } as never,
  );
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
    threadService,
    { hasUpgradedAgentHistory: jest.fn().mockResolvedValue(true) } as never,
  );
  const streaming = {
    streamAgentChat: jest
      .fn()
      .mockResolvedValue({ queued: false, messageId: 'message' }),
  };
  const streamRecovery = { reapDeadStream: jest.fn().mockResolvedValue(null) };
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
    recordEvents as never,
    {} as never,
    {} as never,
  );
  const resolver = new AgentChatResolver(
    chatService,
    threadService,
    sharing as never,
    streaming as never,
    streamRecovery as never,
    events as never,
    {} as never,
    new AgentChatTurnPreflightService(
      {
        getAvailableModels: () => ['model'],
        validateModelAvailability: jest.fn(),
      } as never,
      threadService,
      { assertAiExecutionAllowed: jest.fn() } as never,
    ),
    threadLifecycle,
    { findLatestTurnError: jest.fn().mockResolvedValue(null) } as never,
  );
  return {
    resolver,
    chatService,
    threadService,
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
  it('restores a soft deleted conversation before sending to it', async () => {
    const { resolver, sharing, streaming, threadRepository } = buildResolver();
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
    expect(streaming.streamAgentChat).toHaveBeenCalled();
  });

  it('creates the thread of a new chat on its first message', async () => {
    const { resolver, sharing, threadRepository, streaming } = buildResolver();
    threadRepository.existsBy.mockResolvedValue(false);
    await resolver.sendChatMessage(
      THREAD_ID,
      'Hello',
      'message',
      null,
      undefined,
      null,
      null,
      'member-workspace',
      'owner',
      workspace,
    );
    expect(sharing.createThread).toHaveBeenCalledWith({
      id: THREAD_ID,
      workspaceMemberId: 'owner',
      workspaceId: WORKSPACE_ID,
    });
    expect(streaming.streamAgentChat).toHaveBeenCalled();
  });

  it('does not let a new chat id take over a thread created concurrently by someone else', async () => {
    const { resolver, sharing, threadRepository, streaming } = buildResolver();
    threadRepository.existsBy.mockResolvedValue(false);
    sharing.createThread.mockRejectedValue(
      new TwentyOrmException(
        'Duplicate',
        TwentyOrmExceptionCode.DUPLICATE_ENTRY_DETECTED,
      ),
    );
    await expect(
      resolver.sendChatMessage(
        THREAD_ID,
        'Hello',
        'message',
        null,
        undefined,
        null,
        null,
        'viewer-workspace',
        VIEWER_ID,
        workspace,
      ),
    ).rejects.toMatchObject({ code: 'THREAD_NOT_FOUND' });
    expect(streaming.streamAgentChat).not.toHaveBeenCalled();
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

  it.each(['send', 'deleteQueued'] as const)(
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
            null,
            VIEWER_ID,
            'member',
            workspace,
          ),
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
      expect(context.recordEvents.emit).not.toHaveBeenCalled();
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
      null,
      VIEWER_ID,
      'member',
      workspace,
    );
    expect(streaming.streamAgentChat).toHaveBeenCalledWith(
      expect.objectContaining({
        thread: expect.objectContaining({ id: THREAD_ID }),
        userWorkspaceId: VIEWER_ID,
        workspaceMemberId: 'member',
        text: 'My request',
      }),
    );
  });

  it('adds the mentioned members once the message is sent', async () => {
    const { resolver, threadService, streaming } = buildResolver();
    const addParticipants = jest
      .spyOn(threadService, 'addParticipants')
      .mockResolvedValue(['jony']);

    const result = await resolver.sendChatMessage(
      THREAD_ID,
      'Can you look at this @Jony @Tim',
      'message',
      null,
      undefined,
      null,
      ['jony', 'tim'],
      'owner-user',
      'owner',
      workspace,
    );

    expect(streaming.streamAgentChat).toHaveBeenCalled();
    expect(addParticipants).toHaveBeenCalledWith({
      threadId: THREAD_ID,
      workspaceMemberId: 'owner',
      workspaceId: WORKSPACE_ID,
      participantWorkspaceMemberIds: ['jony', 'tim'],
    });
    expect(result.mentionedParticipantWorkspaceMemberIds).toEqual(['jony']);
  });

  it('keeps a sent message sent when its mentions cannot be applied', async () => {
    const { resolver, threadService } = buildResolver();

    jest
      .spyOn(threadService, 'addParticipants')
      .mockRejectedValue(new Error('share failed'));

    const result = await resolver.sendChatMessage(
      THREAD_ID,
      'Can you look at this @Jony',
      'message',
      null,
      undefined,
      null,
      ['jony'],
      'owner-user',
      'owner',
      workspace,
    );

    expect(result).toMatchObject({
      messageId: 'message',
      mentionedParticipantWorkspaceMemberIds: [],
    });
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
    const { threadService, sharing } = buildResolver();
    sharing.getThreadWithAccess.mockRejectedValue(
      new AiException('Thread not found', AiExceptionCode.THREAD_NOT_FOUND),
    );
    await expect(
      threadService.getWritableThread({
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
