import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { useAgentChatSubscription } from '@/ai/hooks/useAgentChatSubscription';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatFetchedMessagesComponentFamilyState } from '@/ai/states/agentChatFetchedMessagesComponentFamilyState';
import { agentChatQueuedMessagesComponentFamilyState } from '@/ai/states/agentChatQueuedMessagesComponentFamilyState';
import { agentChatErrorComponentFamilyState } from '@/ai/states/agentChatErrorComponentFamilyState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const refreshAgentChatThreads = jest.fn();
const subscribe = jest.fn();
const disconnect = jest.fn();
jest.mock('@/ai/hooks/useRefreshAgentChatThreads', () => ({
  useRefreshAgentChatThreads: () => ({ refreshAgentChatThreads }),
}));
const key = { instanceId: 'sharing-test', familyKey: { threadId: 'thread' } };
const messagesAtom = agentChatMessagesComponentFamilyState.atomFamily(key);
const fetchedAtom =
  agentChatFetchedMessagesComponentFamilyState.atomFamily(key);
const queuedAtom = agentChatQueuedMessagesComponentFamilyState.atomFamily(key);
const errorAtom = agentChatErrorComponentFamilyState.atomFamily(key);
const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <AgentChatComponentInstanceContext.Provider
      value={{ instanceId: key.instanceId }}
    >
      {children}
    </AgentChatComponentInstanceContext.Provider>
  </JotaiProvider>
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
