import { waitFor } from '@testing-library/react';
import { type AgentMessageReactionSummary } from 'twenty-shared/ai';

import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatThreadReplyErrorFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyErrorFamilyState';
import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import { aiChatMessageReactionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionsFamilyState';
import { aiChatThreadFetchedMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadFetchedMessagesFamilyState';
import { type AiChatThreadStreamDependencies } from '@/ai-chat/instance/types/AiChatThreadStreamDependencies';
import { openAiChatThreadStream } from '@/ai-chat/instance/utils/openAiChatThreadStream';
import { type AiChatThreadStream } from '@/ai-chat/types/AiChatThreadStream';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

const key = { threadId: 'thread' };
const messagesAtom = aiChatThreadDisplayedMessagesFamilyState.atomFamily(key);
const fetchedMessagesAtom =
  aiChatThreadFetchedMessagesFamilyState.atomFamily(key);
const errorAtom = aiChatThreadReplyErrorFamilyState.atomFamily(key);
const denial = [
  { message: 'Thread not found', extensions: { code: 'NOT_FOUND' } },
];

const subscribe = jest.fn();
const disconnect = jest.fn();
const query = jest.fn();
const refreshAiChatThreadPermissions = jest.fn();
const refreshAiChatUsage = jest.fn();

const dependencies = {
  apolloClient: { query },
  applyAiChatThreadUpdate: jest.fn(),
  loadAiChatThread: jest.fn(async () => undefined),
  refreshAiChatThreadPermissions,
  refreshAiChatUsage,
} as unknown as AiChatThreadStreamDependencies;

let stream: AiChatThreadStream;

const openStream = () => {
  stream = openAiChatThreadStream({
    threadId: 'thread',
    store: jotaiStore,
    sseClient: { subscribe } as never,
    getDependencies: () => dependencies,
    onResubscribeRequested: () => {
      stream.dispose();
      openStream();
    },
  });

  return stream;
};

const lastSink = () => subscribe.mock.calls[subscribe.mock.calls.length - 1][1];

const sendEvent = (event: object) =>
  lastSink().next({
    data: { onAgentChatEvent: { threadId: 'thread', event } },
  });

beforeEach(() => {
  jest.clearAllMocks();
  resetJotaiStore();
  subscribe.mockReturnValue(disconnect);
  query.mockReturnValue(new Promise(() => {}));
});

describe('Shared conversation access revocation', () => {
  beforeEach(() => {
    const messages = [
      {
        id: 'message',
        role: 'assistant' as const,
        parts: [{ type: 'text' as const, text: 'Private conversation' }],
      },
    ];

    jotaiStore.set(messagesAtom, messages);
    jotaiStore.set(fetchedMessagesAtom, { messages, queuedMessages: messages });
  });

  it('refreshes only the subscribed thread on heartbeats, at most once every 30 seconds', () => {
    jest.useFakeTimers();
    openStream();

    sendEvent({ type: 'keepalive' });
    sendEvent({ type: 'keepalive' });

    expect(refreshAiChatThreadPermissions).toHaveBeenCalledTimes(1);
    expect(refreshAiChatThreadPermissions).toHaveBeenLastCalledWith(['thread']);

    jest.advanceTimersByTime(30_000);
    expect(refreshAiChatThreadPermissions).toHaveBeenCalledTimes(1);

    sendEvent({ type: 'keepalive' });
    expect(refreshAiChatThreadPermissions).toHaveBeenCalledTimes(2);

    stream.dispose();
    sendEvent({ type: 'keepalive' });
    expect(refreshAiChatThreadPermissions).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it.each(['next', 'error'])(
    'clears displayed, fetched, and queued content on a %s access error',
    (channel) => {
      openStream();

      if (channel === 'next') {
        lastSink().next({ errors: denial });
      } else {
        lastSink().error(denial);
      }

      expect(jotaiStore.get(messagesAtom)).toEqual([]);
      expect(jotaiStore.get(fetchedMessagesAtom).messages).toEqual([]);
      expect(jotaiStore.get(fetchedMessagesAtom).queuedMessages).toEqual([]);
      expect(jotaiStore.get(errorAtom)).toMatchObject({ code: 'NOT_FOUND' });
      expect(disconnect).toHaveBeenCalledTimes(1);

      stream.dispose();
      expect(disconnect).toHaveBeenCalledTimes(1);
    },
  );

  it('refetches the conversation when one of its tool calls is resolved', () => {
    openStream();
    expect(query).toHaveBeenCalledTimes(1);

    sendEvent({ type: 'tool-call-resolved', toolCallId: 'call-1' });

    expect(query).toHaveBeenCalledTimes(2);
    stream.dispose();
  });

  it('does not let buffered stream updates restore content after revocation', async () => {
    openStream();

    sendEvent({
      type: 'stream-chunk',
      chunk: { type: 'start', messageId: 'stream-message' },
    });
    sendEvent({
      type: 'stream-chunk',
      chunk: { type: 'text-start', id: 'text' },
    });
    sendEvent({
      type: 'stream-chunk',
      chunk: { type: 'text-delta', id: 'text', delta: 'Buffered content' },
    });

    await waitFor(() =>
      expect(
        jotaiStore
          .get(messagesAtom)
          .some((message) => message.id === 'stream-message'),
      ).toBe(true),
    );

    lastSink().error(denial);
    sendEvent({ type: 'keepalive' });
    sendEvent({
      type: 'stream-chunk',
      chunk: {
        type: 'text-delta',
        id: 'text',
        delta: 'Late content after revocation',
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(jotaiStore.get(messagesAtom)).toEqual([]);
    expect(jotaiStore.get(errorAtom)).toMatchObject({ code: 'NOT_FOUND' });
    stream.dispose();
  });

  it.each(['next', 'error'])(
    'preserves queued messages during session expiry on the %s channel',
    (channel) => {
      openStream();
      const errors = [{ extensions: { code: 'UNAUTHENTICATED' } }];

      if (channel === 'next') {
        lastSink().next({ errors });
      } else {
        lastSink().error(errors);
      }

      expect(jotaiStore.get(messagesAtom)).toHaveLength(1);
      expect(jotaiStore.get(fetchedMessagesAtom).messages).toHaveLength(1);
      expect(jotaiStore.get(fetchedMessagesAtom).queuedMessages).toHaveLength(
        1,
      );
      expect(isGraphqlErrorOfType(jotaiStore.get(errorAtom), 'NOT_FOUND')).toBe(
        false,
      );
      expect(disconnect).not.toHaveBeenCalled();
    },
  );

  it('disconnects when access is denied before the subscription returns', () => {
    subscribe.mockImplementationOnce((_request, sink) => {
      sink.next({ errors: denial });

      return disconnect;
    });

    openStream();
    expect(disconnect).toHaveBeenCalledTimes(1);

    stream.dispose();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('keeps existing messages on an ordinary connection error', () => {
    openStream();
    lastSink().error(new Error('offline'));

    expect(jotaiStore.get(messagesAtom)).toHaveLength(1);
    expect(isGraphqlErrorOfType(jotaiStore.get(errorAtom), 'NOT_FOUND')).toBe(
      false,
    );
  });
});

describe('Stream liveness', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jotaiStore.set(
      aiChatThreadReplyStatusFamilyState.atomFamily(key),
      'awaiting-first-chunk',
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reports a lost connection when resubscribing only yields the initial keepalive, then clears it once broadcasts arrive', () => {
    const keepalive = {
      data: {
        onAgentChatEvent: { threadId: 'thread', event: { type: 'keepalive' } },
      },
    };

    subscribe.mockImplementation((_request, sink) => {
      sink.next(keepalive);

      return disconnect;
    });
    openStream();

    for (let index = 0; index < 15; index++) {
      jest.advanceTimersByTime(2_000);
    }

    expect(subscribe).toHaveBeenCalledTimes(4);
    expect(jotaiStore.get(errorAtom)).toMatchObject({
      code: 'CONNECTION_LOST',
    });

    lastSink().next(keepalive);

    expect(jotaiStore.get(errorAtom)).toBeNull();
    stream.dispose();
  });
});

describe('Message reactions', () => {
  it('keeps the newest snapshot when snapshots arrive out of order', () => {
    openStream();
    const sendReactions = (
      revision: number,
      reactions: AgentMessageReactionSummary[],
    ) =>
      sendEvent({
        type: 'message-reactions-updated',
        messageId: 'message',
        reactions,
        revision,
      });
    const newerReactions = [
      {
        emoji: '👍',
        workspaceMemberIds: ['julia'],
        agentIds: [],
        hasAssistantReacted: false,
      },
      {
        emoji: '🎉',
        workspaceMemberIds: ['tom'],
        agentIds: [],
        hasAssistantReacted: false,
      },
    ];

    sendReactions(2, newerReactions);
    sendReactions(1, [
      {
        emoji: '👍',
        workspaceMemberIds: ['julia'],
        agentIds: [],
        hasAssistantReacted: false,
      },
    ]);

    expect(
      jotaiStore.get(
        aiChatMessageReactionsFamilyState.atomFamily({ messageId: 'message' }),
      ),
    ).toEqual(newerReactions);
    stream.dispose();
  });
});

describe('User credits exhausted', () => {
  const sendUserCreditsExhausted = (workspaceMemberId: string) =>
    sendEvent({
      type: 'user-credits-exhausted',
      workspaceMemberId,
      isFallingBackToWorkspaceCredits: true,
      renewsAt: '2026-10-26T00:00:00.000Z',
    });

  it('refreshes the user credits of the member who sent the turn only', () => {
    jotaiStore.set(currentWorkspaceMemberState.atom, { id: 'julia' } as never);
    openStream();

    sendUserCreditsExhausted('tom');
    expect(refreshAiChatUsage).not.toHaveBeenCalled();

    sendUserCreditsExhausted('julia');
    expect(refreshAiChatUsage).toHaveBeenCalledTimes(1);
    expect(jotaiStore.get(errorAtom)).toBeNull();
    stream.dispose();
  });
});
