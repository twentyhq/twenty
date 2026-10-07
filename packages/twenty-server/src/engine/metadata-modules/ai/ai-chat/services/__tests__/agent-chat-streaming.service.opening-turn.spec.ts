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
  } as unknown as AgentChatThreadWorkspaceEntity;

  const buildService = ({ claimAffected = 1, hasMessages = false } = {}) => {
    const releaseQuery = jest.fn(
      async (_sql: string, _parameters: unknown[]) => [{ id: 'thread-id' }],
    );
    const threadRepository = {
      findOne: jest.fn().mockResolvedValue(thread),
      update: jest.fn().mockResolvedValue({ affected: claimAffected }),
      query: jest.fn().mockImplementation(async (_workspaceId, work) =>
        work({
          table: (name: string) => name,
          manager: { query: releaseQuery },
        }),
      ),
    };
    const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
    const agentChatService = {
      hasMessages: jest.fn().mockResolvedValue(hasMessages),
      getQueuedMessages: jest.fn().mockResolvedValue([]),
      replaceOpeningTurn: jest.fn().mockResolvedValue('opening-turn-id'),
      getMessagesForThread: jest.fn().mockResolvedValue([]),
      getThreadContexts: jest.fn().mockResolvedValue(['Company: Acme Inc']),
    };
    const threadService = {
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
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    return {
      service,
      releaseQuery,
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
    workspaceMemberId: 'member-id',
    workspace,
    context: 'Company: Acme Inc',
    modelId: 'default-fast-model',
  };

  it('returns null without starting a turn when the claim is lost', async () => {
    const {
      service,
      agentChatService,
      messageQueueService,
      streamHeartbeatService,
    } = buildService({ claimAffected: 0 });

    const result = await service.startOpeningTurn(openingTurnArguments);

    expect(result).toBeNull();
    expect(agentChatService.replaceOpeningTurn).not.toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
    expect(streamHeartbeatService.clear).toHaveBeenCalled();
  });

  it('releases the claim and flushes the queue when the conversation already started', async () => {
    const { service, releaseQuery, agentChatService, messageQueueService } =
      buildService({ hasMessages: true });

    const result = await service.startOpeningTurn(openingTurnArguments);

    expect(result).toBeNull();
    expect(agentChatService.replaceOpeningTurn).not.toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
    expect(releaseQuery).toHaveBeenCalledWith(
      expect.stringContaining('"activeStreamId" = NULL'),
      ['thread-id', expect.any(String), null, null],
    );
    expect(agentChatService.getQueuedMessages).toHaveBeenCalledWith({
      threadId: 'thread-id',
      workspaceId: 'workspace-id',
    });
  });

  it('starts over an empty thread and opens a turn on its context alone', async () => {
    const {
      service,
      threadRepository,
      agentChatService,
      threadService,
      messageQueueService,
    } = buildService();

    const result = await service.startOpeningTurn(openingTurnArguments);

    expect(agentChatService.replaceOpeningTurn).toHaveBeenCalledWith({
      threadId: 'thread-id',
      workspaceId: 'workspace-id',
      context: 'Company: Acme Inc',
    });
    expect(messageQueueService.add).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        threadId: 'thread-id',
        messages: [
          {
            id: 'context-0',
            role: 'system',
            parts: [{ type: 'text', text: 'Company: Acme Inc' }],
          },
        ],
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
      { activeStreamId: result?.streamId },
    );
  });

  it('releases the claim and reports an enqueue failure when adding the job fails', async () => {
    const {
      service,
      releaseQuery,
      messageQueueService,
      streamHeartbeatService,
      metricsService,
    } = buildService();

    messageQueueService.add.mockRejectedValue(new Error('redis down'));

    await expect(
      service.startOpeningTurn(openingTurnArguments),
    ).rejects.toThrow('redis down');

    expect(releaseQuery).toHaveBeenLastCalledWith(
      expect.stringContaining('"activeStreamId" = NULL'),
      [
        'thread-id',
        expect.any(String),
        'failed',
        expect.stringContaining('redis down'),
      ],
    );
    expect(streamHeartbeatService.clear).toHaveBeenCalled();
    expect(metricsService.incrementCounterBy).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({ failure_phase: 'enqueue' }),
      }),
    );
  });
});
