import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentChatSubscriptionResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/agent-chat-subscription.resolver';
import { AGENT_CHAT_KEEPALIVE_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-keepalive-interval-ms.constant';

const WORKSPACE_ID = 'workspace';
const THREAD_ID = 'thread';
const VIEWER_ID = 'viewer';
const payload = {
  onAgentChatEvent: {
    threadId: THREAD_ID,
    event: {
      type: 'stream-chunk',
      chunk: { type: 'text-delta', delta: 'private content' },
    },
  },
};
const denied = () =>
  new AiException('Thread not found', AiExceptionCode.THREAD_NOT_FOUND);
const buildResolver = () => {
  let resolvePending: (
    result: IteratorResult<typeof payload>,
  ) => void = () => {};
  const iterator: AsyncIterableIterator<typeof payload> = {
    next: jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePending = resolve;
        }),
    ),
    return: jest.fn().mockImplementation(async () => {
      resolvePending({ done: true, value: undefined });
      return { done: true, value: undefined };
    }),
    [Symbol.asyncIterator]() {
      return this;
    },
  };
  const sharingService = {
    getReadableThread: jest.fn().mockResolvedValue({ id: THREAD_ID }),
  };
  const subscriptionService = {
    subscribeToAgentChat: jest.fn().mockResolvedValue(iterator),
    publishToAgentChat: jest.fn(),
  };
  const resolver = new AgentChatSubscriptionResolver(
    subscriptionService as never,
    {} as never,
    sharingService as never,
    { findOne: jest.fn().mockResolvedValue(null) } as never,
  );
  return {
    resolver,
    sharingService,
    subscriptionService,
    iterator,
    deliver: () => resolvePending({ done: false, value: payload }),
  };
};

describe('Shared conversation subscriptions', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('refuses unauthorized subscriptions before opening a transport', async () => {
    const { resolver, sharingService, subscriptionService } = buildResolver();
    sharingService.getReadableThread.mockRejectedValue(denied());
    await expect(
      resolver.onAgentChatEvent(
        THREAD_ID,
        { id: WORKSPACE_ID } as never,
        VIEWER_ID,
      ),
    ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    expect(subscriptionService.subscribeToAgentChat).not.toHaveBeenCalled();
  });

  it('delivers events to authorized viewers and closes cleanly on disconnect', async () => {
    const context = buildResolver();
    const subscription = await context.resolver.onAgentChatEvent(
      THREAD_ID,
      { id: WORKSPACE_ID } as never,
      VIEWER_ID,
    );
    await subscription.next();
    const pending = subscription.next();
    context.deliver();
    await expect(pending).resolves.toEqual({ done: false, value: payload });
    expect(context.sharingService.getReadableThread).toHaveBeenLastCalledWith({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
      userWorkspaceId: VIEWER_ID,
    });
    await subscription.return?.();
    expect(context.iterator.return).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('rejects an already pending event when its authorization expires', async () => {
    const context = buildResolver();
    const subscription = await context.resolver.onAgentChatEvent(
      THREAD_ID,
      { id: WORKSPACE_ID } as never,
      VIEWER_ID,
    );
    await subscription.next();
    const pending = subscription.next();
    context.sharingService.getReadableThread.mockRejectedValue(denied());
    jest.setSystemTime(Date.now() + AGENT_CHAT_KEEPALIVE_INTERVAL_MS);
    context.deliver();
    await expect(pending).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
    expect(context.iterator.return).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('does not query authorization once per token during a burst', async () => {
    const context = buildResolver();
    const subscription = await context.resolver.onAgentChatEvent(
      THREAD_ID,
      { id: WORKSPACE_ID } as never,
      VIEWER_ID,
    );
    await subscription.next();
    for (let index = 0; index < 200; index++) {
      const pending = subscription.next();
      context.deliver();
      await pending;
    }
    expect(context.sharingService.getReadableThread).toHaveBeenCalledTimes(1);
    await subscription.return?.();
  });

  it('closes an idle subscription after revocation without waiting for content', async () => {
    const context = buildResolver();
    const subscription = await context.resolver.onAgentChatEvent(
      THREAD_ID,
      { id: WORKSPACE_ID } as never,
      VIEWER_ID,
    );
    await subscription.next();
    const pending = subscription.next();
    const rejection = expect(pending).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
    context.sharingService.getReadableThread.mockRejectedValue(denied());
    await jest.advanceTimersByTimeAsync(AGENT_CHAT_KEEPALIVE_INTERVAL_MS);
    await rejection;
    expect(
      context.subscriptionService.publishToAgentChat,
    ).not.toHaveBeenCalled();
    expect(context.iterator.return).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });
});
