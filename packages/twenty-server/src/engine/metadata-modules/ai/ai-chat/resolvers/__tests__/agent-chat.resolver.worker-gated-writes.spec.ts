import { AgentChatResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/agent-chat.resolver';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const WORKSPACE = { id: 'workspace-id' } as WorkspaceEntity;
const MESSAGE_ID = 'message-id';
const THREAD_ID = 'thread-id';
const WORKER_ID = 'worker-user-workspace-id';
const PUBLIC_READER_ID = 'public-reader-user-workspace-id';

// Dropping a queued message is a write, so a public-channel reader who can see
// the thread is not thereby allowed to clear somebody else's queue.
const buildResolver = () => {
  const threadRepository = {
    findOne: jest
      .fn()
      .mockImplementation((_workspaceId, { where }) =>
        Promise.resolve(
          where.some(
            (clause: Record<string, unknown>) =>
              clause.userWorkspaceId === WORKER_ID ||
              clause.assigneeUserWorkspaceId === WORKER_ID,
          )
            ? { id: THREAD_ID }
            : null,
        ),
      ),
  };

  const agentChatService = {
    findQueuedMessage: jest
      .fn()
      .mockResolvedValue({ id: MESSAGE_ID, threadId: THREAD_ID }),
    deleteQueuedMessage: jest.fn().mockResolvedValue(true),
  };

  const eventPublisherService = {
    publish: jest.fn().mockResolvedValue(undefined),
  };

  const resolver = Object.create(
    AgentChatResolver.prototype,
  ) as AgentChatResolver;

  Object.assign(resolver, {
    threadRepository,
    agentChatService,
    eventPublisherService,
  });

  return { resolver, agentChatService, eventPublisherService };
};

const deleteQueued = (resolver: AgentChatResolver, userWorkspaceId: string) =>
  resolver.deleteQueuedChatMessage(MESSAGE_ID, userWorkspaceId, WORKSPACE);

describe('AgentChatResolver.stopAgentChatStream', () => {
  const buildStreamResolver = () => {
    const threadRepository = {
      findOne: jest
        .fn()
        .mockImplementation((_workspaceId, { where }) =>
          Promise.resolve(
            where.some(
              (clause: Record<string, unknown>) =>
                clause.userWorkspaceId === WORKER_ID ||
                clause.assigneeUserWorkspaceId === WORKER_ID,
            )
              ? { id: THREAD_ID, activeStreamId: 'stream-id' }
              : null,
          ),
        ),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const redis = { publish: jest.fn().mockResolvedValue(1) };

    const resolver = Object.create(
      AgentChatResolver.prototype,
    ) as AgentChatResolver;

    Object.assign(resolver, {
      threadRepository,
      redisClientService: { getClient: () => redis },
    });

    return { resolver, threadRepository, redis };
  };

  it('lets somebody working the thread stop the stream', async () => {
    const { resolver, threadRepository, redis } = buildStreamResolver();

    await expect(
      resolver.stopAgentChatStream(THREAD_ID, WORKER_ID, WORKSPACE),
    ).resolves.toBe(true);
    expect(redis.publish).toHaveBeenCalled();
    expect(threadRepository.update).toHaveBeenCalled();
  });

  // Sending is gated the same way, so a reader who cannot start a stream is
  // never left with one they cannot stop.
  it('leaves the stream alone for a reader who has not joined', async () => {
    const { resolver, threadRepository, redis } = buildStreamResolver();

    await expect(
      resolver.stopAgentChatStream(THREAD_ID, PUBLIC_READER_ID, WORKSPACE),
    ).resolves.toBe(true);
    expect(redis.publish).not.toHaveBeenCalled();
    expect(threadRepository.update).not.toHaveBeenCalled();
  });
});

describe('AgentChatResolver.deleteQueuedChatMessage', () => {
  it('lets somebody working the thread drop a queued message', async () => {
    const { resolver, agentChatService, eventPublisherService } =
      buildResolver();

    await expect(deleteQueued(resolver, WORKER_ID)).resolves.toBe(true);
    expect(agentChatService.deleteQueuedMessage).toHaveBeenCalledWith({
      messageId: MESSAGE_ID,
      workspaceId: WORKSPACE.id,
    });
    expect(eventPublisherService.publish).toHaveBeenCalled();
  });

  it('refuses a reader who only sees the thread through a public channel', async () => {
    const { resolver, agentChatService } = buildResolver();

    await expect(
      deleteQueued(resolver, PUBLIC_READER_ID),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_JOINED });
    expect(agentChatService.deleteQueuedMessage).not.toHaveBeenCalled();
  });

  it('refuses a message that is no longer queued before looking at the thread', async () => {
    const { resolver, agentChatService } = buildResolver();

    agentChatService.findQueuedMessage.mockResolvedValue(null);

    await expect(deleteQueued(resolver, WORKER_ID)).rejects.toMatchObject({
      code: AiExceptionCode.MESSAGE_NOT_FOUND,
    });
  });
});
