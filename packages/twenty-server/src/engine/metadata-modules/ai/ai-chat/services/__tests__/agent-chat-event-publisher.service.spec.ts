import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';

describe('AgentChatEventPublisherService', () => {
  const buildService = () => {
    const redis = {
      rpush: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      del: jest.fn().mockResolvedValue(1),
    };
    const subscriptionService = {
      publishToAgentChat: jest.fn().mockResolvedValue(undefined),
    };
    const service = new AgentChatEventPublisherService(
      subscriptionService as never,
      { getClient: () => redis } as never,
    );

    return { service, redis, subscriptionService };
  };

  it('accumulates stream chunks with a 1-based sequence number', async () => {
    const { service, redis, subscriptionService } = buildService();

    redis.rpush.mockResolvedValue(7);

    await service.publish({
      threadId: 'thread-id',
      workspaceId: 'workspace-id',
      event: { type: 'stream-chunk', chunk: { type: 'text-delta' } } as never,
    });

    expect(redis.rpush).toHaveBeenCalledWith(
      'agent-chat-stream-chunks:thread-id',
      JSON.stringify({ type: 'text-delta' }),
    );
    expect(subscriptionService.publishToAgentChat).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          onAgentChatEvent: {
            threadId: 'thread-id',
            event: expect.objectContaining({ seq: 7 }),
          },
        },
      }),
    );
  });

  it.each(['message-persisted', 'credits-exhausted'] as const)(
    'deletes the accumulated chunk list on terminal %s',
    async (type) => {
      const { service, redis } = buildService();

      await service.publish({
        threadId: 'thread-id',
        workspaceId: 'workspace-id',
        event: { type } as never,
      });

      expect(redis.del).toHaveBeenCalledWith(
        'agent-chat-stream-chunks:thread-id',
      );
    },
  );

  it('keeps the chunk list on stream-error so catchup can replay the partial turn', async () => {
    const { service, redis } = buildService();

    await service.publish({
      threadId: 'thread-id',
      workspaceId: 'workspace-id',
      event: { type: 'stream-error', code: 'X', message: 'boom' } as never,
    });

    expect(redis.del).not.toHaveBeenCalled();
  });
});
