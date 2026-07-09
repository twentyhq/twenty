import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  AgentMessageRole,
  AgentMessageStatus,
  type AgentMessageEntity,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
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
  } as unknown as AgentChatThreadEntity;

  const userMessageEntity = {
    id: 'user-message-id',
    role: AgentMessageRole.USER,
    status: AgentMessageStatus.SENT,
    parts: [{ type: 'text', textContent: 'hello', orderIndex: 0 }],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  } as unknown as AgentMessageEntity;

  const buildService = ({
    thread = failedThread,
    lastUserMessage = { id: 'user-message-id', turnId: 'turn-id' },
    threadMessages = [userMessageEntity],
  } = {}) => {
    const threadRepository = {
      findOne: jest.fn().mockResolvedValue(thread),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
    const agentChatService = {
      findLatestSentUserMessage: jest.fn().mockResolvedValue(lastUserMessage),
      deleteAssistantMessagesForTurn: jest.fn().mockResolvedValue(undefined),
      getMessagesForThread: jest.fn().mockResolvedValue(threadMessages),
    };

    const streamHeartbeatService = {
      markClaimed: jest.fn().mockResolvedValue(undefined),
      isAlive: jest.fn().mockResolvedValue(true),
      clear: jest.fn().mockResolvedValue(undefined),
    };

    const service = new AgentChatStreamingService(
      threadRepository as never,
      { find: jest.fn() } as never,
      messageQueueService as never,
      agentChatService as never,
      { publish: jest.fn() } as never,
      { signFileByIdUrl: jest.fn() } as never,
      streamHeartbeatService as never,
      { incrementCounterBy: jest.fn() } as never,
    );

    return { service, threadRepository, messageQueueService, agentChatService };
  };

  const retryArguments = {
    threadId: 'thread-id',
    userWorkspaceId: 'user-workspace-id',
    workspace,
  };

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

  it('rejects and restores the error state when a newer message exists', async () => {
    const newerAssistantMessage = {
      ...userMessageEntity,
      id: 'newer-message-id',
      role: AgentMessageRole.ASSISTANT,
    } as unknown as AgentMessageEntity;
    const { service, threadRepository, messageQueueService } = buildService({
      threadMessages: [userMessageEntity, newerAssistantMessage],
    });

    await expect(
      service.retryLastFailedTurn(retryArguments),
    ).rejects.toMatchObject({
      code: AiExceptionCode.NO_FAILED_TURN_TO_RETRY,
    });
    expect(messageQueueService.add).not.toHaveBeenCalled();
    expect(threadRepository.update).toHaveBeenLastCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: expect.any(String) },
      {
        activeStreamId: null,
        lastStreamError: failedThread.lastStreamError,
      },
    );
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
});
