import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';

describe('AgentChatStreamingService.startOpeningTurn', () => {
  const workspace = { id: 'workspace-id' } as WorkspaceEntity;

  const thread = {
    id: 'thread-id',
    title: 'Workspace setup',
    conversationSize: 0,
    activeStreamId: null,
    lastStreamError: null,
  } as unknown as AgentChatThreadWorkspaceEntity;

  const buildService = ({ claimAffected = 1, hasMessages = false } = {}) => {
    const threadRepository = {
      findOne: jest.fn().mockResolvedValue(thread),
      update: jest.fn().mockResolvedValue({ affected: claimAffected }),
    };
    const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
    const agentChatService = {
      hasMessages: jest.fn().mockResolvedValue(hasMessages),
      getQueuedMessages: jest.fn().mockResolvedValue([]),
      deleteTurns: jest.fn().mockResolvedValue(undefined),
    };
    const threadService = {
      openAgentTurn: jest.fn().mockResolvedValue('opening-turn-id'),
      notifyThreadActivityUpdated: jest.fn().mockResolvedValue(undefined),
    };
    const streamHeartbeatService = {
      markClaimed: jest.fn().mockResolvedValue(undefined),
      isAlive: jest.fn().mockResolvedValue(true),
      clear: jest.fn().mockResolvedValue(undefined),
    };
    const metricsService = { incrementCounterBy: jest.fn() };
    const eventPublisherService = {
      publish: jest.fn(),
      resetStreamState: jest.fn(),
    };

    const service = new AgentChatStreamingService(
      threadRepository as never,
      { find: jest.fn().mockResolvedValue([]) } as never,
      messageQueueService as never,
      agentChatService as never,
      threadService as never,
      eventPublisherService as never,
      { signFileByIdUrl: jest.fn() } as never,
      streamHeartbeatService as never,
      metricsService as never,
      new AgentChatStreamRecoveryService(
        threadRepository as never,
        streamHeartbeatService as never,
        eventPublisherService as never,
        metricsService as never,
      ),
      {} as never,
      {} as never,
    );

    return {
      service,
      threadRepository,
      messageQueueService,
      agentChatService,
      threadService,
      streamHeartbeatService,
      metricsService,
    };
  };

  const openingTurnArguments = {
    thread,
    userWorkspaceId: 'user-workspace-id',
    workspace,
    context: 'Company: Acme Inc',
    modelId: 'default-fast-model',
  };

  it('returns null without starting a turn when the claim is lost', async () => {
    const {
      service,
      threadService,
      messageQueueService,
      streamHeartbeatService,
    } = buildService({ claimAffected: 0 });

    const result = await service.startOpeningTurn(openingTurnArguments);

    expect(result).toBeNull();
    expect(threadService.openAgentTurn).not.toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
    expect(streamHeartbeatService.clear).toHaveBeenCalled();
  });

  it('releases the claim and flushes the queue when the conversation already started', async () => {
    const {
      service,
      threadRepository,
      agentChatService,
      threadService,
      messageQueueService,
    } = buildService({ hasMessages: true });

    const result = await service.startOpeningTurn(openingTurnArguments);

    expect(result).toBeNull();
    expect(threadService.openAgentTurn).not.toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: expect.any(String) },
      { activeStreamId: null },
    );
    expect(agentChatService.getQueuedMessages).toHaveBeenCalledWith({
      threadId: 'thread-id',
      workspaceId: 'workspace-id',
    });
  });

  it('starts over the turns of an empty thread and opens one on the context alone', async () => {
    const {
      service,
      threadRepository,
      agentChatService,
      threadService,
      messageQueueService,
    } = buildService();

    const result = await service.startOpeningTurn(openingTurnArguments);

    expect(agentChatService.deleteTurns).toHaveBeenCalledWith({
      threadId: 'thread-id',
      workspaceId: 'workspace-id',
    });
    expect(threadService.openAgentTurn).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      context: 'Company: Acme Inc',
    });
    expect(messageQueueService.add).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        threadId: 'thread-id',
        browsingContext: null,
        modelId: 'default-fast-model',
        hasTitle: true,
        existingTurnId: 'opening-turn-id',
      }),
    );
    expect(messageQueueService.add.mock.calls[0][1]).not.toHaveProperty(
      'messageId',
    );
    expect(threadService.notifyThreadActivityUpdated).not.toHaveBeenCalled();
    expect(result).toEqual({
      streamId: expect.any(String),
      turnId: 'opening-turn-id',
    });
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      expect.objectContaining({ id: 'thread-id' }),
      { activeStreamId: result?.streamId, lastStreamError: null },
    );
  });

  it('releases the claim and reports an enqueue failure when adding the job fails', async () => {
    const {
      service,
      threadRepository,
      messageQueueService,
      streamHeartbeatService,
      metricsService,
    } = buildService();

    messageQueueService.add.mockRejectedValue(new Error('redis down'));

    await expect(
      service.startOpeningTurn(openingTurnArguments),
    ).rejects.toThrow('redis down');

    expect(threadRepository.update).toHaveBeenLastCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: expect.any(String) },
      { activeStreamId: null },
    );
    expect(streamHeartbeatService.clear).toHaveBeenCalled();
    expect(metricsService.incrementCounterBy).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({ failure_phase: 'enqueue' }),
      }),
    );
  });
});
