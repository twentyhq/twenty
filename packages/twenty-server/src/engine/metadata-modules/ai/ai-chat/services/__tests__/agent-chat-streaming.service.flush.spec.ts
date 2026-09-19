import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';

describe('AgentChatStreamingService.flushNextQueuedMessage', () => {
  const idleThread = {
    id: 'thread-id',
    conversationSize: 0,
    deletedAt: null,
    activeStreamId: null,
    pendingQuestionMessageId: null,
  };

  const buildQueuedMessage = ({
    id = 'queued-message-id',
    authorUserWorkspaceId = 'queued-author' as string | null,
  } = {}) => ({
    id,
    authorUserWorkspaceId,
    parts: [{ type: 'text', textContent: 'my turn', orderIndex: 0 }],
  });

  const buildService = ({
    queuedMessages = [buildQueuedMessage()] as unknown[],
    threadForAuthor = idleThread as unknown,
  } = {}) => {
    const publishedEvents: Array<{ type: string }> = [];
    const threadRepository = {
      findOne: jest
        .fn()
        .mockImplementation((_workspaceId, { where }) =>
          Promise.resolve(Array.isArray(where) ? threadForAuthor : idleThread),
        ),
      findOneOrFail: jest.fn().mockResolvedValue(idleThread),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
    const remainingQueuedMessages = [...queuedMessages];
    const agentChatService = {
      getQueuedMessages: jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve([...remainingQueuedMessages]),
        ),
      deleteQueuedMessage: jest.fn().mockImplementation(({ messageId }) => {
        const index = remainingQueuedMessages.findIndex(
          (message) => (message as { id: string }).id === messageId,
        );

        remainingQueuedMessages.splice(index, 1);

        return Promise.resolve(true);
      }),
      promoteQueuedMessage: jest.fn().mockResolvedValue('turn-id'),
      getMessagesForThread: jest.fn().mockResolvedValue([]),
    };
    const eventPublisherService = {
      publish: jest.fn().mockImplementation(({ event }) => {
        publishedEvents.push(event);

        return Promise.resolve();
      }),
    };
    const streamHeartbeatService = {
      markClaimed: jest.fn().mockResolvedValue(undefined),
      isAlive: jest.fn().mockResolvedValue(true),
      clear: jest.fn().mockResolvedValue(undefined),
    };

    const service = new AgentChatStreamingService(
      threadRepository as never,
      { find: jest.fn().mockResolvedValue([]) } as never,
      messageQueueService as never,
      agentChatService as never,
      eventPublisherService as never,
      { signFileByIdUrl: jest.fn() } as never,
      streamHeartbeatService as never,
      { incrementCounterBy: jest.fn() } as never,
    );

    return {
      service,
      threadRepository,
      messageQueueService,
      agentChatService,
      publishedEvents,
    };
  };

  it('runs the queued turn as the person who queued it, not as the previous sender', async () => {
    const { service, messageQueueService, agentChatService } = buildService();

    await service.flushNextQueuedMessage('thread-id', 'workspace-id', true);

    const [, jobData] = messageQueueService.add.mock.calls[0];

    expect(jobData.userWorkspaceId).toBe('queued-author');
    expect(agentChatService.getMessagesForThread).toHaveBeenCalledWith(
      expect.objectContaining({ userWorkspaceId: 'queued-author' }),
    );
  });

  it('drops a queued message whose author no longer works the thread', async () => {
    const { service, messageQueueService, agentChatService, publishedEvents } =
      buildService({ threadForAuthor: null });

    await service.flushNextQueuedMessage('thread-id', 'workspace-id', true);

    expect(messageQueueService.add).not.toHaveBeenCalled();
    expect(agentChatService.promoteQueuedMessage).not.toHaveBeenCalled();
    expect(agentChatService.deleteQueuedMessage).toHaveBeenCalledWith({
      messageId: 'queued-message-id',
      workspaceId: 'workspace-id',
    });
    expect(publishedEvents).toContainEqual({ type: 'queue-updated' });
  });

  it('keeps draining the queue after dropping an unrunnable message', async () => {
    const { service, messageQueueService, agentChatService } = buildService({
      queuedMessages: [
        buildQueuedMessage({
          id: 'authorless-message-id',
          authorUserWorkspaceId: null,
        }),
        buildQueuedMessage({ id: 'next-message-id' }),
      ],
    });

    await service.flushNextQueuedMessage('thread-id', 'workspace-id', true);

    expect(agentChatService.deleteQueuedMessage).toHaveBeenCalledWith({
      messageId: 'authorless-message-id',
      workspaceId: 'workspace-id',
    });
    expect(agentChatService.promoteQueuedMessage).toHaveBeenCalledWith(
      expect.objectContaining({ messageId: 'next-message-id' }),
    );
    expect(messageQueueService.add.mock.calls[0][1].userWorkspaceId).toBe(
      'queued-author',
    );
  });
});
