import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';

describe('AgentChatStreamingService claim & reap', () => {
  const workspace = { id: 'workspace-id' } as WorkspaceEntity;

  const idleThread = {
    id: 'thread-id',
    title: 'Thread',
    conversationSize: 0,
    activeStreamId: null,
    lastStreamError: null,
    pendingQuestionMessageId: null,
  };

  const buildService = ({
    thread = idleThread,
    claimAffected = 1,
    queuedMessages = [] as unknown[],
  } = {}) => {
    const publishedEvents: Array<{ type: string }> = [];
    const threadRepository = {
      findOne: jest.fn().mockResolvedValue(thread),
      findOneOrFail: jest.fn().mockResolvedValue(thread),
      update: jest.fn().mockResolvedValue({ affected: claimAffected }),
    };
    const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
    const agentChatService = {
      addMessage: jest
        .fn()
        .mockResolvedValue({ id: 'user-message-id', turnId: 'turn-id' }),
      notifyThreadActivityUpdated: jest.fn().mockResolvedValue(undefined),
      getMessagesForThread: jest.fn().mockResolvedValue([]),
      getQueuedMessages: jest.fn().mockResolvedValue(queuedMessages),
      hasQueuedMessages: jest
        .fn()
        .mockImplementation(() => Promise.resolve(queuedMessages.length > 0)),
      queueMessage: jest.fn().mockResolvedValue({ id: 'queued-message-id' }),
      promoteQueuedMessage: jest.fn().mockResolvedValue('turn-id'),
      deleteQueuedMessage: jest.fn().mockResolvedValue(true),
    };
    const eventPublisherService = {
      publish: jest.fn().mockImplementation(({ event }) => {
        publishedEvents.push(event);

        return Promise.resolve();
      }),
      resetStreamState: jest.fn().mockResolvedValue(undefined),
    };
    const service = new AgentChatStreamingService(
      threadRepository as never,
      { find: jest.fn().mockResolvedValue([]) } as never,
      messageQueueService as never,
      agentChatService as never,
      eventPublisherService as never,
      { signFileByIdUrl: jest.fn() } as never,
    );

    return {
      service,
      threadRepository,
      messageQueueService,
      agentChatService,
      eventPublisherService,
      publishedEvents,
    };
  };

  const sendArguments = {
    threadId: 'thread-id',
    userWorkspaceId: 'user-workspace-id',
    workspace,
    text: 'hello',
    browsingContext: null,
  };

  describe('streamAgentChat', () => {
    it('claims the thread conditionally before enqueueing', async () => {
      const { service, threadRepository } = buildService();

      const result = await service.streamAgentChat(sendArguments);

      expect(result.queued).toBe(false);
      expect(threadRepository.update).toHaveBeenCalledWith(
        'workspace-id',
        expect.objectContaining({ id: 'thread-id' }),
        expect.objectContaining({ lastStreamError: null }),
      );
    });

    it('queues the message when another stream wins the claim race', async () => {
      const { service, agentChatService, messageQueueService } = buildService({
        claimAffected: 0,
      });

      const result = await service.streamAgentChat(sendArguments);

      expect(result.queued).toBe(true);
      expect(agentChatService.queueMessage).toHaveBeenCalled();
      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('queues behind a halted backlog and kicks the drain from the front', async () => {
      const { service, agentChatService } = buildService({
        queuedMessages: [
          {
            id: 'older-queued-id',
            parts: [{ type: 'text', textContent: 'first in line' }],
          },
        ],
      });

      const result = await service.streamAgentChat(sendArguments);

      expect(result.queued).toBe(true);
      expect(agentChatService.queueMessage).toHaveBeenCalled();
      expect(agentChatService.promoteQueuedMessage).toHaveBeenCalledWith(
        expect.objectContaining({ messageId: 'older-queued-id' }),
      );
    });

    it('releases the claim when enqueueing the job fails', async () => {
      const { service, threadRepository, messageQueueService } = buildService();

      messageQueueService.add.mockRejectedValue(new Error('redis down'));

      await expect(service.streamAgentChat(sendArguments)).rejects.toThrow(
        'redis down',
      );

      expect(threadRepository.update).toHaveBeenLastCalledWith(
        'workspace-id',
        { id: 'thread-id', activeStreamId: expect.any(String) },
        { activeStreamId: null },
      );
    });
  });
});
