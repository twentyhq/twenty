import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';

describe('AgentChatStreamingService answerPendingQuestionAndResumeStream', () => {
  const workspace = { id: 'workspace-id' } as WorkspaceEntity;

  const thread = {
    id: 'thread-id',
    title: 'Thread',
    conversationSize: 0,
    activeStreamId: null,
    lastStreamError: null,
    pendingQuestionMessageId: 'question-message-id',
  };

  const buildService = () => {
    const publishedEvents: Array<{ type: string }> = [];
    const threadRepository = {
      findOne: jest.fn().mockResolvedValue(thread),
      findOneOrFail: jest.fn().mockResolvedValue(thread),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
    const agentChatService = {
      resolvePendingQuestion: jest.fn().mockResolvedValue({
        turnId: 'turn-id',
        rollback: { partId: 'part-id', previousOutput: {} },
      }),
      restorePendingQuestion: jest.fn().mockResolvedValue(undefined),
      getMessagesForThread: jest.fn().mockResolvedValue([]),
    };
    const eventPublisherService = {
      publish: jest.fn().mockImplementation(({ event }) => {
        publishedEvents.push(event);

        return Promise.resolve();
      }),
      resetStreamState: jest.fn().mockResolvedValue(undefined),
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
      eventPublisherService,
      streamHeartbeatService,
      publishedEvents,
    };
  };

  const answerArguments = {
    threadId: 'thread-id',
    messageId: 'question-message-id',
    answers: [{ questionIndex: 0, selectedOptionIndices: [0] }],
    userWorkspaceId: 'user-workspace-id',
    workspace,
  };

  it('marks the heartbeat before the pending question claims the thread', async () => {
    const { service, agentChatService, streamHeartbeatService } =
      buildService();

    const result =
      await service.answerPendingQuestionAndResumeStream(answerArguments);

    expect(result).toEqual({
      streamId: expect.any(String),
      turnId: 'turn-id',
    });
    expect(streamHeartbeatService.markClaimed).toHaveBeenCalledWith(
      result.streamId,
    );
    expect(
      streamHeartbeatService.markClaimed.mock.invocationCallOrder[0],
    ).toBeLessThan(
      agentChatService.resolvePendingQuestion.mock.invocationCallOrder[0],
    );
    expect(streamHeartbeatService.clear).not.toHaveBeenCalled();
  });

  it('publishes question-answered only after the resume job is enqueued', async () => {
    const { service, messageQueueService, eventPublisherService } =
      buildService();

    await service.answerPendingQuestionAndResumeStream(answerArguments);

    expect(eventPublisherService.publish).toHaveBeenCalledWith(
      expect.objectContaining({ event: { type: 'question-answered' } }),
    );
    expect(messageQueueService.add.mock.invocationCallOrder[0]).toBeLessThan(
      eventPublisherService.publish.mock.invocationCallOrder[0],
    );
    expect(messageQueueService.add).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        threadId: 'thread-id',
        existingTurnId: 'turn-id',
        isResume: true,
      }),
    );
  });

  it('clears the heartbeat and rethrows when there is no pending question', async () => {
    const {
      service,
      agentChatService,
      messageQueueService,
      streamHeartbeatService,
      publishedEvents,
    } = buildService();

    agentChatService.resolvePendingQuestion.mockRejectedValue(
      new Error('No pending question to answer'),
    );

    await expect(
      service.answerPendingQuestionAndResumeStream(answerArguments),
    ).rejects.toThrow('No pending question to answer');

    expect(streamHeartbeatService.clear).toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
    expect(publishedEvents).toHaveLength(0);
  });

  it('restores the question and clears the heartbeat when enqueueing fails', async () => {
    const {
      service,
      agentChatService,
      messageQueueService,
      streamHeartbeatService,
      publishedEvents,
    } = buildService();

    messageQueueService.add.mockRejectedValue(new Error('redis down'));

    await expect(
      service.answerPendingQuestionAndResumeStream(answerArguments),
    ).rejects.toThrow('redis down');

    expect(agentChatService.restorePendingQuestion).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: 'thread-id',
        messageId: 'question-message-id',
        rollback: { partId: 'part-id', previousOutput: {} },
      }),
    );
    expect(streamHeartbeatService.clear).toHaveBeenCalled();
    expect(publishedEvents).toHaveLength(0);
  });
});
