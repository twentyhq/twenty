import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { AiChatSharingRefreshEffect } from '@/ai/components/AiChatSharingRefreshEffect';
import { useChatThreadSharing } from '@/ai/hooks/useChatThreadSharing';

jest.mock('twenty-ui/primitives/feedback', () => ({
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

const createHarness = () => {
  const request = jest.fn(() => ({
    chatThreadSharing: {
      __typename: 'AgentChatThreadSharing',
      canManage: true,
      isEnabled: true,
      shares: [],
      roles: [],
    },
  }));
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
      () =>
        new Observable((observer) => {
          try {
            observer.next({ data: request() });
            observer.complete();
          } catch (error) {
            observer.error(error);
          }
        }),
    ),
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
  return { request, wrapper };
};

describe('useChatThreadSharing', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('fetches availability once while closed and polls only while open', async () => {
    const { request, wrapper } = createHarness();
    const { result, rerender } = renderHook(
      ({ isOpen }) => useChatThreadSharing('thread', isOpen),
      { wrapper, initialProps: { isOpen: false } },
    );
    await waitFor(() => expect(result.current.sharing?.isEnabled).toBe(true));
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    expect(request).toHaveBeenCalledTimes(1);
    rerender({ isOpen: true });
    await act(async () => {
      jest.advanceTimersByTime(30_001);
    });
    expect(request).toHaveBeenCalledTimes(2);
    rerender({ isOpen: false });
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('refreshes on focus and removes the listener on unmount', async () => {
    const { request, wrapper } = createHarness();
    const TestSharingRefresh = () => {
      const { refetch } = useChatThreadSharing('thread', false);
      return <AiChatSharingRefreshEffect refetch={refetch} />;
    };
    const { unmount } = render(<TestSharingRefresh />, { wrapper });
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(request).toHaveBeenCalledTimes(2);
    unmount();
    window.dispatchEvent(new Event('focus'));
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('retains confirmed availability on a refresh error so retry stays reachable', async () => {
    const { request, wrapper } = createHarness();
    const { result } = renderHook(() => useChatThreadSharing('thread', false), {
      wrapper,
    });
    await waitFor(() => expect(result.current.sharing?.isEnabled).toBe(true));
    request.mockImplementationOnce(() => {
      throw new Error('Network unavailable');
    });
    await act(async () => {
      await result.current.refetch().catch(() => {});
    });
    expect(result.current.error).toBeDefined();
    expect(result.current.sharing?.isEnabled).toBe(true);
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toBeUndefined();
    expect(result.current.sharing?.isEnabled).toBe(true);
  });
});
