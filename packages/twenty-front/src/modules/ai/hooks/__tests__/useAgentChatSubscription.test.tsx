import { act, render, renderHook, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AgentChatStreamKeepAliveEffect } from '@/ai/components/AgentChatStreamKeepAliveEffect';
import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { AGENT_CHAT_STREAM_LIVENESS_CHECK_INTERVAL_IN_MS } from '@/ai/constants/AgentChatStreamLivenessCheckIntervalInMs';
import { useAgentChatSubscription } from '@/ai/hooks/useAgentChatSubscription';
import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { agentChatFetchedMessagesFamilyState } from '@/ai/states/agentChatFetchedMessagesFamilyState';
import { agentChatQueuedMessagesFamilyState } from '@/ai/states/agentChatQueuedMessagesFamilyState';
import { agentChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { agentChatStreamRecoveryAttemptsState } from '@/ai/states/agentChatStreamRecoveryAttemptsState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { createAiChatCodedError } from '@/ai/utils/createAiChatCodedError';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

const refreshAgentChatThreads = jest.fn();
const mockRefreshPermissions = jest.fn();
jest.mock('@/ai/hooks/useRefreshAgentChatThreadPermissions', () => ({
  useRefreshAgentChatThreadPermissions: () => ({
    refreshAgentChatThreadPermissions: mockRefreshPermissions,
  }),
}));
const subscribe = jest.fn();
const disconnect = jest.fn();
jest.mock('@/ai/hooks/useRefreshAgentChatThreads', () => ({
  useRefreshAgentChatThreads: () => ({ refreshAgentChatThreads }),
}));
const key = { threadId: 'thread' };
const messagesAtom = agentChatMessagesFamilyState.atomFamily(key);
const fetchedAtom = agentChatFetchedMessagesFamilyState.atomFamily(key);
const queuedAtom = agentChatQueuedMessagesFamilyState.atomFamily(key);
const errorAtom = agentChatErrorFamilyState.atomFamily(key);
const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);
const denial = [
  { message: 'Thread not found', extensions: { code: 'NOT_FOUND' } },
];

describe('Shared conversation access revocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    subscribe.mockReturnValue(disconnect);
    jotaiStore.set(sseClientState.atom, { subscribe } as never);
    const messages = [
      {
        id: 'message',
        role: 'assistant' as const,
        parts: [{ type: 'text' as const, text: 'Private conversation' }],
      },
    ];
    jotaiStore.set(messagesAtom, messages);
    jotaiStore.set(fetchedAtom, messages);
    jotaiStore.set(queuedAtom, messages);
  });

  it('refreshes only the subscribed thread on heartbeats, at most once every 30 seconds', () => {
    jest.useFakeTimers();
    const { unmount } = renderHook(() => useAgentChatSubscription('thread'), {
      wrapper: Wrapper,
    });
    const sink = subscribe.mock.calls[0][1];
    const heartbeat = () =>
      sink.next({
        data: {
          onAgentChatEvent: {
            threadId: 'thread',
            event: { type: 'keepalive' },
          },
        },
      });
    act(() => {
      heartbeat();
      heartbeat();
    });
    expect(mockRefreshPermissions).toHaveBeenCalledTimes(1);
    expect(mockRefreshPermissions).toHaveBeenLastCalledWith(['thread']);
    act(() => jest.advanceTimersByTime(30_000));
    expect(mockRefreshPermissions).toHaveBeenCalledTimes(1);
    act(heartbeat);
    expect(mockRefreshPermissions).toHaveBeenCalledTimes(2);
    expect(refreshAgentChatThreads).not.toHaveBeenCalled();
    unmount();
    act(heartbeat);
    expect(mockRefreshPermissions).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it.each(['next', 'error'])(
    'clears displayed, fetched, and queued content on a %s access error',
    async (channel) => {
      const { unmount } = renderHook(() => useAgentChatSubscription('thread'), {
        wrapper: Wrapper,
      });
      const sink = subscribe.mock.calls[0][1];
      act(() =>
        channel === 'next' ? sink.next({ errors: denial }) : sink.error(denial),
      );
      expect(jotaiStore.get(messagesAtom)).toEqual([]);
      expect(jotaiStore.get(fetchedAtom)).toEqual([]);
      expect(jotaiStore.get(queuedAtom)).toEqual([]);
      expect(jotaiStore.get(errorAtom)).toMatchObject({ code: 'NOT_FOUND' });
      expect(refreshAgentChatThreads).toHaveBeenCalledTimes(1);
      expect(disconnect).toHaveBeenCalledTimes(1);
      unmount();
      expect(disconnect).toHaveBeenCalledTimes(1);
    },
  );

  it('refetches the conversation when one of its tool calls is resolved', () => {
    const refetchListener = jest.fn();
    window.addEventListener(
      AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME,
      refetchListener,
    );
    const { unmount } = renderHook(() => useAgentChatSubscription('thread'), {
      wrapper: Wrapper,
    });
    act(() =>
      subscribe.mock.calls[0][1].next({
        data: {
          onAgentChatEvent: {
            threadId: 'thread',
            event: { type: 'tool-call-resolved', toolCallId: 'call-1' },
          },
        },
      }),
    );
    expect(refetchListener).toHaveBeenCalledTimes(1);
    unmount();
    window.removeEventListener(
      AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME,
      refetchListener,
    );
  });

  it('clears content and disconnects when the AI permission guard denies access', () => {
    renderHook(() => useAgentChatSubscription('thread'), { wrapper: Wrapper });
    act(() =>
      subscribe.mock.calls[0][1].error([{ extensions: { code: 'FORBIDDEN' } }]),
    );
    expect(jotaiStore.get(messagesAtom)).toEqual([]);
    expect(jotaiStore.get(queuedAtom)).toEqual([]);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('does not let buffered stream updates restore content after revocation', async () => {
    const { unmount } = renderHook(() => useAgentChatSubscription('thread'), {
      wrapper: Wrapper,
    });
    const sink = subscribe.mock.calls[0][1];
    const send = (chunk: object) =>
      sink.next({
        data: {
          onAgentChatEvent: {
            threadId: 'thread',
            event: { type: 'stream-chunk', chunk },
          },
        },
      });
    await act(async () => {
      send({ type: 'start', messageId: 'stream-message' });
      send({ type: 'text-start', id: 'text' });
      send({ type: 'text-delta', id: 'text', delta: 'Buffered content' });
    });
    await waitFor(() =>
      expect(
        jotaiStore
          .get(messagesAtom)
          .some((message) => message.id === 'stream-message'),
      ).toBe(true),
    );
    act(() => {
      sink.error(denial);
      sink.next({
        data: {
          onAgentChatEvent: {
            threadId: 'thread',
            event: { type: 'keepalive' },
          },
        },
      });
      send({
        type: 'text-delta',
        id: 'text',
        delta: 'Late content after revocation',
      });
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
    expect(jotaiStore.get(messagesAtom)).toEqual([]);
    expect(jotaiStore.get(errorAtom)).toMatchObject({ code: 'NOT_FOUND' });
    unmount();
  });

  it.each(['next', 'error'])(
    'preserves queued messages during session expiry on the %s channel',
    (channel) => {
      renderHook(() => useAgentChatSubscription('thread'), {
        wrapper: Wrapper,
      });
      const sink = subscribe.mock.calls[0][1];
      const errors = [{ extensions: { code: 'UNAUTHENTICATED' } }];
      act(() =>
        channel === 'next' ? sink.next({ errors }) : sink.error(errors),
      );
      expect(jotaiStore.get(messagesAtom)).toHaveLength(1);
      expect(jotaiStore.get(fetchedAtom)).toHaveLength(1);
      expect(jotaiStore.get(queuedAtom)).toHaveLength(1);
      expect(refreshAgentChatThreads).not.toHaveBeenCalled();
      expect(disconnect).not.toHaveBeenCalled();
    },
  );

  it('disconnects when access is denied before the subscription returns', () => {
    subscribe.mockImplementationOnce((_request, sink) => {
      sink.next({ errors: denial });
      return disconnect;
    });
    const { unmount } = renderHook(() => useAgentChatSubscription('thread'), {
      wrapper: Wrapper,
    });
    expect(disconnect).toHaveBeenCalledTimes(1);
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('keeps existing messages on an ordinary connection error', () => {
    renderHook(() => useAgentChatSubscription('thread'), { wrapper: Wrapper });
    act(() => subscribe.mock.calls[0][1].error(new Error('offline')));
    expect(jotaiStore.get(messagesAtom)).toHaveLength(1);
    expect(refreshAgentChatThreads).not.toHaveBeenCalled();
  });
});

describe('Stream recovery', () => {
  const recoveringThreadId = '6d1c2f4e-3a5b-4c7d-8e9f-0a1b2c3d4e5f';
  const recoveringKey = { threadId: recoveringThreadId };
  const recoveringErrorAtom =
    agentChatErrorFamilyState.atomFamily(recoveringKey);

  const keepalive = {
    data: {
      onAgentChatEvent: {
        threadId: recoveringThreadId,
        event: { type: 'keepalive' },
      },
    },
  };

  const isConnectionLost = () =>
    isGraphqlErrorOfType(
      jotaiStore.get(recoveringErrorAtom),
      AiChatErrorCode.CONNECTION_LOST,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    subscribe.mockReturnValue(disconnect);
    jotaiStore.set(sseClientState.atom, { subscribe } as never);
  });

  it('only treats events after the first one as proof that the subscription delivers', () => {
    const refetchListener = jest.fn();
    window.addEventListener(
      AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME,
      refetchListener,
    );
    jotaiStore.set(agentChatStreamRecoveryAttemptsState.atom, 2);
    jotaiStore.set(
      recoveringErrorAtom,
      createAiChatCodedError('lost', AiChatErrorCode.CONNECTION_LOST),
    );
    renderHook(() => useAgentChatSubscription(recoveringThreadId), {
      wrapper: Wrapper,
    });
    const sink = subscribe.mock.calls[0][1];

    act(() => sink.next(keepalive));

    expect(jotaiStore.get(agentChatStreamRecoveryAttemptsState.atom)).toBe(2);
    expect(isConnectionLost()).toBe(true);
    expect(refetchListener).not.toHaveBeenCalled();

    act(() => sink.next(keepalive));

    expect(jotaiStore.get(agentChatStreamRecoveryAttemptsState.atom)).toBe(0);
    expect(jotaiStore.get(recoveringErrorAtom)).toBeNull();
    expect(refetchListener).toHaveBeenCalledTimes(1);
    window.removeEventListener(
      AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME,
      refetchListener,
    );
  });

  it('reports a lost connection when resubscribing never delivers', () => {
    jest.useFakeTimers();
    jotaiStore.set(currentAiChatThreadState.atom, recoveringThreadId);
    jotaiStore.set(
      agentChatIsAwaitingFirstChunkFamilyState.atomFamily(recoveringKey),
      true,
    );

    const RecoveryHarness = () => {
      useAgentChatSubscription(recoveringThreadId);

      return <AgentChatStreamKeepAliveEffect />;
    };

    render(<RecoveryHarness />, { wrapper: Wrapper });

    for (let index = 0; index < 20; index++) {
      act(() => {
        jest.advanceTimersByTime(
          AGENT_CHAT_STREAM_LIVENESS_CHECK_INTERVAL_IN_MS,
        );
      });
    }

    expect(isConnectionLost()).toBe(true);
    expect(subscribe).toHaveBeenCalledTimes(4);
    jest.useRealTimers();
  });
});
