import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const queued = {
  id: 'message-b',
  senderUserWorkspaceId: 'participant-b',
  parts: [{ type: 'text', textContent: 'B’s request' }],
};
const build = () => {
  const threads = {
    findOne: jest.fn().mockResolvedValue({ id: 'thread' }),
    findOneOrFail: jest
      .fn()
      .mockResolvedValue({ id: 'thread', conversationSize: 0 }),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const queue = { add: jest.fn().mockResolvedValue(undefined) };
  const chat = {
    getQueuedMessages: jest.fn().mockResolvedValue([queued]),
    promoteQueuedMessage: jest.fn().mockResolvedValue('turn-b'),
    getMessagesForThread: jest.fn().mockResolvedValue([]),
    getThreadContexts: jest.fn().mockResolvedValue([]),
    deleteQueuedMessage: jest.fn().mockResolvedValue(true),
  };
  const actors = {
    resolveMessage: jest.fn().mockResolvedValue({
      sender: { userWorkspaceId: 'participant-b', applicationId: null },
    }),
    authorize: jest
      .fn()
      .mockResolvedValue({ authContext: { workspaceMemberId: 'member' } }),
  };
  const heartbeat = { markClaimed: jest.fn(), clear: jest.fn() };
  const events = { publish: jest.fn() };
  const metrics = { incrementCounterBy: jest.fn() };
  const service = new AgentChatStreamingService(
    threads as never,
    {} as never,
    queue as never,
    chat as never,
    {} as never,
    events as never,
    {} as never,
    heartbeat as never,
    metrics as never,
    new AgentChatStreamRecoveryService(
      threads as never,
      heartbeat as never,
      events as never,
      metrics as never,
    ),
    actors as never,
    {
      findPendingForThread: jest.fn().mockResolvedValue([]),
      hasPendingForThread: jest.fn().mockResolvedValue(false),
    } as never,
    {} as never,
    {} as never,
    {} as never,
    { findIncludedChatModel: jest.fn().mockResolvedValue(null) } as never,
  );
  return { service, threads, queue, chat, actors, heartbeat };
};
const args = {
  workspace: { id: 'workspace' } as WorkspaceEntity,
  threadId: 'thread',
};

describe('Sender-aware queue draining', () => {
  it('starts the next turn as its saved sender', async () => {
    const { service, queue, chat } = build();
    await service.flushNextQueuedMessage(args);
    expect(chat.getMessagesForThread).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceMemberId: 'member' }),
    );
    expect(queue.add).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        userWorkspaceId: 'participant-b',
        messageId: 'message-b',
        existingTurnId: 'turn-b',
      }),
    );
  });
  it('preserves a non-owner request when a worker cannot yet authorize thread access', async () => {
    const { service, actors, chat, queue } = build();
    actors.authorize.mockRejectedValue(
      new AiException('Thread not found', AiExceptionCode.THREAD_NOT_FOUND),
    );
    await service.flushNextQueuedMessage(args);
    expect(chat.deleteQueuedMessage).not.toHaveBeenCalled();
    expect(chat.promoteQueuedMessage).not.toHaveBeenCalled();
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('removes revoked queued work before promoting or invoking it', async () => {
    const { service, actors, chat, queue } = build();
    actors.authorize.mockRejectedValue(
      new AuthException(
        'Membership removed',
        AuthExceptionCode.UNAUTHENTICATED,
      ),
    );
    await service.flushNextQueuedMessage(args);
    expect(chat.deleteQueuedMessage).toHaveBeenCalledWith({
      workspaceId: 'workspace',
      messageId: 'message-b',
    });
    expect(chat.promoteQueuedMessage).not.toHaveBeenCalled();
    expect(queue.add).not.toHaveBeenCalled();
  });
  it('continues with an authorized participant after a revoked queue entry', async () => {
    const { service, actors, chat, queue } = build();
    chat.getQueuedMessages.mockResolvedValue([
      { ...queued, id: 'revoked' },
      queued,
    ]);
    actors.authorize.mockRejectedValueOnce(
      new AuthException(
        'Membership removed',
        AuthExceptionCode.UNAUTHENTICATED,
      ),
    );
    await service.flushNextQueuedMessage(args);
    expect(chat.deleteQueuedMessage).toHaveBeenCalledWith({
      workspaceId: 'workspace',
      messageId: 'revoked',
    });
    expect(queue.add).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        messageId: 'message-b',
        userWorkspaceId: 'participant-b',
      }),
    );
  });
  it('preserves the queue when authorization fails because of infrastructure', async () => {
    const { service, actors, chat, queue } = build();
    actors.authorize.mockRejectedValue(new Error('Database unavailable'));
    await expect(service.flushNextQueuedMessage(args)).rejects.toThrow(
      'Database unavailable',
    );
    expect(chat.deleteQueuedMessage).not.toHaveBeenCalled();
    expect(queue.add).not.toHaveBeenCalled();
  });
  it('does not enqueue when another worker wins message promotion', async () => {
    const { service, chat, queue, heartbeat } = build();
    chat.promoteQueuedMessage.mockResolvedValue(null);
    await service.flushNextQueuedMessage(args);
    expect(queue.add).not.toHaveBeenCalled();
    expect(heartbeat.clear).toHaveBeenCalled();
  });
  it('opens the conversation with the thread contexts as system messages', async () => {
    const { service, chat, queue } = build();
    const message = (id: string, role: string, createdAt: string) => ({
      id,
      role,
      createdAt,
      parts: [{ type: 'text', textContent: id }],
    });
    chat.getMessagesForThread.mockResolvedValue([
      message('inbox-message', 'assistant', '2026-01-01T11:00:01.000Z'),
      message('follow-up', 'user', '2026-01-01T12:00:00.000Z'),
    ]);
    chat.getThreadContexts.mockResolvedValue([
      'Billing app started this conversation.',
    ]);
    await service.flushNextQueuedMessage(args);
    const { messages } = queue.add.mock.calls[0][1];
    expect(messages.map(({ id }: { id: string }) => id)).toEqual([
      'context-0',
      'inbox-message',
      'follow-up',
    ]);
    expect(messages[0]).toEqual({
      id: 'context-0',
      role: 'system',
      parts: [{ type: 'text', text: 'Billing app started this conversation.' }],
    });
  });
});
