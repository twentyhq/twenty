import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';

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
    deleteQueuedMessage: jest.fn().mockResolvedValue(true),
  };
  const actors = {
    resolveMessage: jest.fn().mockResolvedValue({
      sender: { userWorkspaceId: 'participant-b', applicationId: null },
    }),
    authorize: jest.fn().mockResolvedValue({}),
  };
  const heartbeat = { markClaimed: jest.fn(), clear: jest.fn() };
  const service = new AgentChatStreamingService(
    threads as never,
    {} as never,
    queue as never,
    chat as never,
    { publish: jest.fn() } as never,
    {} as never,
    heartbeat as never,
    { incrementCounterBy: jest.fn() } as never,
    {} as never,
    actors as never,
  );
  return { service, threads, queue, chat, actors, heartbeat };
};
const args = { workspaceId: 'workspace', threadId: 'thread', hasTitle: true };

describe('Sender-aware queue draining', () => {
  it('starts the next turn as its saved sender', async () => {
    const { service, queue, chat } = build();
    await service.flushNextQueuedMessage(args);
    expect(chat.getMessagesForThread).toHaveBeenCalledWith(
      expect.objectContaining({ userWorkspaceId: 'participant-b' }),
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
  it('excludes the owner’s hidden setup context from another participant’s execution', async () => {
    const { service, chat, threads, queue } = build();
    threads.findOneOrFail.mockResolvedValue({
      id: 'thread',
      conversationSize: 0,
      userWorkspaceId: 'owner',
    });
    chat.getMessagesForThread.mockResolvedValue([
      {
        id: 'hidden-owner',
        isHidden: true,
        senderUserWorkspaceId: 'owner',
        parts: [{ type: 'text', textContent: 'Owner private context' }],
      },
      {
        id: 'visible',
        role: 'user',
        createdAt: new Date(),
        parts: [{ type: 'text', textContent: 'Shared content' }],
      },
    ]);
    await service.flushNextQueuedMessage(args);
    expect(queue.add).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        messages: [expect.objectContaining({ id: 'visible' })],
      }),
    );
  });
});
