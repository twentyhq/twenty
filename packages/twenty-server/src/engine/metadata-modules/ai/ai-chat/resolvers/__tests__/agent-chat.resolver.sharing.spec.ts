import { AgentChatResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/agent-chat.resolver';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

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
  };
  const sharing = {
    getReadableThread: jest
      .fn()
      .mockResolvedValue({ id: THREAD_ID, userWorkspaceId: 'owner' }),
    deleteThreadShares: jest.fn(),
  };
  const chatService = new AgentChatService(
    threadRepository as never,
    {} as never,
    messages as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    sharing as never,
  );
  const streaming = {
    streamAgentChat: jest.fn(),
    answerPendingQuestionAndResumeStream: jest.fn(),
    reapDeadStream: jest.fn().mockResolvedValue(null),
  };
  const events = {
    publish: jest.fn(),
    getAccumulatedChunks: jest
      .fn()
      .mockResolvedValue({ chunks: [], maxSeq: 0 }),
  };
  const redis = { getClient: jest.fn() };
  const resolver = new AgentChatResolver(
    chatService,
    sharing as never,
    streaming as never,
    events as never,
    {} as never,
    { assertAiExecutionAllowed: jest.fn() } as never,
    {
      getAvailableModels: () => ['model'],
      validateModelAvailability: jest.fn(),
    } as never,
    redis as never,
    threadRepository as never,
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
  };
};

describe('Shared conversation API boundaries', () => {
  it('returns readable threads and catchup to viewers without granting ownership', async () => {
    const { resolver } = buildResolver();
    const thread = await resolver.chatThread(THREAD_ID, VIEWER_ID, workspace);
    expect(resolver.canManage(thread, VIEWER_ID)).toBe(false);
    expect(resolver.canManage(thread, 'owner')).toBe(true);
    await expect(
      resolver.chatStreamCatchupChunks(THREAD_ID, VIEWER_ID, workspace),
    ).resolves.toMatchObject({ chunks: [] });
  });

  it.each([
    'send',
    'answer',
    'rename',
    'archive',
    'unarchive',
    'delete',
    'deleteQueued',
  ] as const)(
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
            workspace,
          ),
        answer: () =>
          resolver.answerAgentChatQuestion(
            THREAD_ID,
            'message',
            [],
            undefined,
            null,
            VIEWER_ID,
            workspace,
          ),
        rename: () =>
          resolver.renameChatThread(THREAD_ID, 'Changed', VIEWER_ID, workspace),
        archive: () =>
          resolver.archiveChatThread(THREAD_ID, VIEWER_ID, workspace),
        unarchive: () =>
          resolver.unarchiveChatThread(THREAD_ID, VIEWER_ID, workspace),
        delete: () =>
          resolver.deleteChatThread(THREAD_ID, VIEWER_ID, workspace),
        deleteQueued: () =>
          resolver.deleteQueuedChatMessage('queued', VIEWER_ID, workspace),
      };
      await expect(operations[operation]()).rejects.toMatchObject({
        code: 'THREAD_NOT_FOUND',
      });
      if (operation === 'rename') {
        expect(context.threadRepository.update).toHaveBeenCalledWith(
          WORKSPACE_ID,
          { id: THREAD_ID, userWorkspaceId: VIEWER_ID },
          { title: 'Changed' },
        );
      } else {
        expect(context.threadRepository.findOne).toHaveBeenCalledWith(
          WORKSPACE_ID,
          { where: { id: THREAD_ID, userWorkspaceId: VIEWER_ID } },
        );
        expect(context.threadRepository.update).not.toHaveBeenCalled();
      }
      expect(context.threadRepository.delete).not.toHaveBeenCalled();
      expect(context.messages.delete).not.toHaveBeenCalled();
      expect(context.streaming.streamAgentChat).not.toHaveBeenCalled();
      expect(
        context.streaming.answerPendingQuestionAndResumeStream,
      ).not.toHaveBeenCalled();
      expect(context.events.publish).not.toHaveBeenCalled();
      expect(context.redis.getClient).not.toHaveBeenCalled();
    },
  );

  it('does not cancel an owner stream when a viewer requests stop', async () => {
    const { resolver, redis, threadRepository } = buildResolver();
    await resolver.stopAgentChatStream(THREAD_ID, VIEWER_ID, workspace);
    expect(redis.getClient).not.toHaveBeenCalled();
    expect(threadRepository.update).not.toHaveBeenCalled();
  });

  it('denies hidden history to viewers even when the visible thread is shared', async () => {
    const { chatService, messages } = buildResolver();
    await expect(
      chatService.getMessagesForThread({
        threadId: THREAD_ID,
        userWorkspaceId: VIEWER_ID,
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
