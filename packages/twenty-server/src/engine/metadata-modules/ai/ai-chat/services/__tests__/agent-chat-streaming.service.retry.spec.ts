import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

describe('AgentChatStreamingService.retryLastFailedTurn', () => {
  const workspace = { id: 'workspace-id' } as WorkspaceEntity;

  const failedThread = {
    id: 'thread-id',
    title: 'Thread title',
    conversationSize: 42,
    activeStreamId: null,
    lastStreamError: {
      code: 'STREAM_EXECUTION_FAILED',
      message: 'Provider timed out',
      failedAt: '2026-01-01T00:00:00.000Z',
    },
  } as unknown as AgentChatThreadWorkspaceEntity;

  const userMessageEntity = {
    id: 'user-message-id',
    role: AgentMessageRole.USER,
    status: AgentMessageStatus.SENT,
    parts: [{ type: 'text', textContent: 'hello', orderIndex: 0 }],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  } as unknown as AgentMessageWorkspaceEntity;

  const buildService = ({
    thread = failedThread,
    turnUserMessage = { id: 'user-message-id' } as { id: string } | null,
    threadMessages = [userMessageEntity],
  } = {}) => {
    const threadRepository = {
      findOneOrFail: jest
        .fn()
        .mockResolvedValue({ workspaceMemberId: 'member' }),
      findOne: jest.fn().mockResolvedValue(thread),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
    const agentChatService = {
      findLatestTurnId: jest.fn().mockResolvedValue('turn-id'),
      deleteAssistantMessagesForTurn: jest.fn().mockResolvedValue(undefined),
      getMessagesForThread: jest.fn().mockResolvedValue(threadMessages),
      getTurnContexts: jest.fn().mockResolvedValue([]),
    };
    const threadService = {
      getWritableThread: jest
        .fn()
        .mockImplementation(() => threadRepository.findOne()),
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
      { find: jest.fn() } as never,
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
      {
        authorizeRetry: jest
          .fn()
          .mockResolvedValue({ message: turnUserMessage }),
      } as never,
      {
        findPendingForThread: jest.fn().mockResolvedValue([]),
        hasPendingForThread: jest.fn().mockResolvedValue(false),
        cancel: jest.fn().mockResolvedValue(false),
      } as never,
    );

    return {
      service,
      threadRepository,
      messageQueueService,
      agentChatService,
      threadService,
    };
  };

  const retryArguments = {
    workspaceMemberId: 'member',
    threadId: 'thread-id',
    userWorkspaceId: 'user-workspace-id',
    workspace,
  };

  it('rejects a shared viewer without deleting messages or scheduling execution', async () => {
    const {
      service,
      threadRepository,
      messageQueueService,
      agentChatService,
      threadService,
    } = buildService();
    threadService.getWritableThread.mockRejectedValue({
      code: AiExceptionCode.THREAD_NOT_FOUND,
    });
    await expect(
      service.retryLastFailedTurn(retryArguments),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
    expect(threadService.getWritableThread).toHaveBeenCalledWith({
      workspaceId: workspace.id,
      threadId: retryArguments.threadId,
      workspaceMemberId: retryArguments.workspaceMemberId,
    });
    expect(threadRepository.update).not.toHaveBeenCalled();
    expect(
      agentChatService.deleteAssistantMessagesForTurn,
    ).not.toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('rejects when the thread has no persisted stream error', async () => {
    const { service, messageQueueService } = buildService({
      thread: { ...failedThread, lastStreamError: null },
    });

    await expect(
      service.retryLastFailedTurn(retryArguments),
    ).rejects.toMatchObject({
      code: AiExceptionCode.NO_FAILED_TURN_TO_RETRY,
    });
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('rejects when a stream is already active', async () => {
    const { service, messageQueueService } = buildService({
      thread: { ...failedThread, activeStreamId: 'stream-id' },
    });

    await expect(
      service.retryLastFailedTurn(retryArguments),
    ).rejects.toMatchObject({
      code: AiExceptionCode.NO_FAILED_TURN_TO_RETRY,
    });
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('drops the failed output, re-enqueues the turn, and clears the error', async () => {
    const { service, threadRepository, messageQueueService, agentChatService } =
      buildService();

    const result = await service.retryLastFailedTurn({
      ...retryArguments,
      modelId: 'model-id',
    });

    expect(
      agentChatService.deleteAssistantMessagesForTurn,
    ).toHaveBeenCalledWith({ turnId: 'turn-id', workspaceId: 'workspace-id' });
    expect(messageQueueService.add).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        threadId: 'thread-id',
        existingTurnId: 'turn-id',
        lastUserMessageText: 'hello',
        modelId: 'model-id',
        hasTitle: true,
        conversationSizeTokens: 42,
      }),
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      expect.objectContaining({ id: 'thread-id' }),
      { activeStreamId: result.streamId, lastStreamError: null },
    );
    expect(result.messageId).toBe('user-message-id');
    expect(result.turnId).toBe('turn-id');
  });

  it('retries a turn the agent opened, which has no user message', async () => {
    const { service, messageQueueService, agentChatService } = buildService({
      turnUserMessage: null,
      threadMessages: [],
    });
    agentChatService.getTurnContexts.mockResolvedValue([
      {
        turnId: 'turn-id',
        context: 'Company: Acme Inc',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    const result = await service.retryLastFailedTurn(retryArguments);

    expect(
      agentChatService.deleteAssistantMessagesForTurn,
    ).toHaveBeenCalledWith({ turnId: 'turn-id', workspaceId: 'workspace-id' });
    expect(messageQueueService.add).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        messages: [
          expect.objectContaining({
            id: 'turn-context-turn-id',
            role: 'user',
            parts: [
              {
                type: 'text',
                text: expect.stringContaining('Company: Acme Inc'),
              },
            ],
          }),
        ],
        existingTurnId: 'turn-id',
        lastUserMessageText: '',
      }),
    );
    expect(result.messageId).toBeNull();
    expect(result.turnId).toBe('turn-id');
  });

  it('does not delete another participant’s output if the latest turn changes while claiming a retry', async () => {
    const { service, agentChatService, messageQueueService } = buildService();
    agentChatService.findLatestTurnId
      .mockResolvedValueOnce('turn-id')
      .mockResolvedValueOnce('another-turn');
    await expect(
      service.retryLastFailedTurn(retryArguments),
    ).rejects.toMatchObject({ code: AiExceptionCode.NO_FAILED_TURN_TO_RETRY });
    expect(
      agentChatService.deleteAssistantMessagesForTurn,
    ).not.toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });
});
