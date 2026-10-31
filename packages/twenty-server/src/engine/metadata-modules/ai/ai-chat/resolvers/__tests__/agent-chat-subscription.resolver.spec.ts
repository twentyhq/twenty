import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentChatSubscriptionResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/agent-chat-subscription.resolver';
import { AGENT_CHAT_KEEPALIVE_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-keepalive-interval-ms.constant';

const WORKSPACE_ID = 'workspace';
const THREAD_ID = 'thread';
const VIEWER_ID = 'viewer';
const WORKSPACE = {
  id: WORKSPACE_ID,
  workspaceCustomApplicationId: 'workspace-custom-application-id',
};
const APPLICATION = {
  id: 'application',
  universalIdentifier: 'application-universal-identifier',
  sourceType: ApplicationRegistrationSourceType.NPM,
};

type AgentChatEventPayload = {
  onAgentChatEvent: { threadId: string; event: AgentChatSubscriptionEvent };
};

const payload: AgentChatEventPayload = {
  onAgentChatEvent: {
    threadId: THREAD_ID,
    event: {
      type: 'stream-chunk',
      chunk: { type: 'text-delta', delta: 'private content' },
    },
  },
};
const toChunkPayload = (
  chunk: Record<string, unknown>,
): AgentChatEventPayload => ({
  onAgentChatEvent: {
    threadId: THREAD_ID,
    event: { type: 'stream-chunk', chunk, seq: 1 },
  },
});
const denied = () =>
  new AiException('Thread not found', AiExceptionCode.THREAD_NOT_FOUND);
const buildResolver = () => {
  let resolvePending: (
    result: IteratorResult<AgentChatEventPayload>,
  ) => void = () => {};
  const iterator: AsyncIterableIterator<AgentChatEventPayload> = {
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
  const conversationAccessService = {
    resolveReadableThreadIdOrThrow: jest.fn().mockResolvedValue(THREAD_ID),
    createLiveEventFilter: jest
      .fn()
      .mockResolvedValue(async (event: AgentChatSubscriptionEvent) => event),
  };
  const subscriptionService = {
    subscribeToAgentChat: jest.fn().mockResolvedValue(iterator),
    publishToAgentChat: jest.fn(),
  };
  const resolver = new AgentChatSubscriptionResolver(
    subscriptionService as never,
    {} as never,
    conversationAccessService as never,
    { findOne: jest.fn().mockResolvedValue(null) } as never,
  );
  return {
    resolver,
    conversationAccessService,
    subscriptionService,
    iterator,
    deliver: (value = payload) => resolvePending({ done: false, value }),
  };
};

describe('Shared conversation subscriptions', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('refuses unauthorized subscriptions before opening a transport', async () => {
    const { resolver, conversationAccessService, subscriptionService } =
      buildResolver();
    conversationAccessService.resolveReadableThreadIdOrThrow.mockRejectedValue(
      denied(),
    );
    await expect(
      resolver.onAgentChatEvent(
        { threadId: THREAD_ID },
        WORKSPACE,
        undefined,
        VIEWER_ID,
      ),
    ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    expect(subscriptionService.subscribeToAgentChat).not.toHaveBeenCalled();
  });

  it('delivers events to authorized viewers and closes cleanly on disconnect', async () => {
    const context = buildResolver();
    const subscription = await context.resolver.onAgentChatEvent(
      { threadId: THREAD_ID },
      WORKSPACE,
      undefined,
      VIEWER_ID,
    );
    await subscription.next();
    const pending = subscription.next();
    context.deliver();
    await expect(pending).resolves.toEqual({ done: false, value: payload });
    expect(
      context.conversationAccessService.resolveReadableThreadIdOrThrow,
    ).toHaveBeenLastCalledWith({
      workspace: WORKSPACE,
      callerApplication: undefined,
      workspaceMemberId: VIEWER_ID,
      conversation: { threadId: THREAD_ID },
    });
    await subscription.return?.();
    expect(context.iterator.return).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('follows the thread an application names by its agent and key', async () => {
    const context = buildResolver();
    const conversation = {
      agentUniversalIdentifier: 'agent-universal-identifier',
      threadKey: 'deal-42',
    };
    const subscription = await context.resolver.onAgentChatEvent(
      conversation,
      WORKSPACE,
      APPLICATION,
      undefined,
    );

    await expect(subscription.next()).resolves.toEqual({
      done: false,
      value: {
        onAgentChatEvent: { threadId: THREAD_ID, event: { type: 'keepalive' } },
      },
    });
    expect(
      context.conversationAccessService.resolveReadableThreadIdOrThrow,
    ).toHaveBeenCalledWith(expect.objectContaining({ conversation }));
    expect(
      context.subscriptionService.subscribeToAgentChat,
    ).toHaveBeenCalledWith({ workspaceId: WORKSPACE_ID, threadId: THREAD_ID });
    await subscription.return?.();
  });

  it('passes every event through the visibility filter for the viewer', async () => {
    const context = buildResolver();
    const maskedChunk = { type: 'message-metadata', messageMetadata: {} };

    context.conversationAccessService.createLiveEventFilter.mockResolvedValue(
      async (event: AgentChatSubscriptionEvent) =>
        event.type === 'stream-chunk'
          ? { ...event, chunk: maskedChunk }
          : event,
    );

    const subscription = await context.resolver.onAgentChatEvent(
      { threadId: THREAD_ID },
      WORKSPACE,
      undefined,
      VIEWER_ID,
    );

    await subscription.next();

    const pending = subscription.next();

    context.deliver(
      toChunkPayload({ type: 'reasoning-delta', delta: 'Notes' }),
    );
    await expect(pending).resolves.toEqual({
      done: false,
      value: toChunkPayload(maskedChunk),
    });
    expect(
      context.conversationAccessService.createLiveEventFilter,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
      workspaceMemberId: VIEWER_ID,
    });
    await subscription.return?.();
  });

  it('rejects an already pending event when its authorization expires', async () => {
    const context = buildResolver();
    const subscription = await context.resolver.onAgentChatEvent(
      { threadId: THREAD_ID },
      WORKSPACE,
      undefined,
      VIEWER_ID,
    );
    await subscription.next();
    const pending = subscription.next();
    context.conversationAccessService.resolveReadableThreadIdOrThrow.mockRejectedValue(
      denied(),
    );
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
      { threadId: THREAD_ID },
      WORKSPACE,
      undefined,
      VIEWER_ID,
    );
    await subscription.next();
    for (let index = 0; index < 200; index++) {
      const pending = subscription.next();
      context.deliver();
      await pending;
    }
    expect(
      context.conversationAccessService.resolveReadableThreadIdOrThrow,
    ).toHaveBeenCalledTimes(1);
    await subscription.return?.();
  });

  it('closes an idle subscription after revocation without waiting for content', async () => {
    const context = buildResolver();
    const subscription = await context.resolver.onAgentChatEvent(
      { threadId: THREAD_ID },
      WORKSPACE,
      undefined,
      VIEWER_ID,
    );
    await subscription.next();
    const pending = subscription.next();
    const rejection = expect(pending).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
    context.conversationAccessService.resolveReadableThreadIdOrThrow.mockRejectedValue(
      denied(),
    );
    await jest.advanceTimersByTimeAsync(AGENT_CHAT_KEEPALIVE_INTERVAL_MS);
    await rejection;
    expect(
      context.subscriptionService.publishToAgentChat,
    ).not.toHaveBeenCalled();
    expect(context.iterator.return).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });
});
