import { act, renderHook } from '@testing-library/react';
import { type Client } from 'graphql-sse';
import { createStore, Provider } from 'jotai';
import { createElement, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { useHandleSseClientConnectionRetry } from '@/sse-db-event/hooks/useHandleSseClientConnectionRetry';

jest.mock('~/utils/sleep', () => ({
  sleep: jest.fn().mockResolvedValue(undefined),
}));

// The hook only ever calls dispose, but the atom holds a full Client, so the
// unused members are stubbed rather than cast away.
const buildSseClient = (dispose: () => void): Client => ({
  subscribe: () => () => {},
  iterate: async function* () {},
  dispose,
});

const setupStore = ({
  isCookieAuthActive,
}: {
  isCookieAuthActive: boolean;
}) => {
  const store = createStore();
  const dispose = jest.fn();

  store.set(sseClientState.atom, buildSseClient(dispose));
  store.set(shouldDestroyEventStreamState.atom, false);
  store.set(isCookieAuthActiveState.atom, isCookieAuthActive);

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(Provider, { store }, children);

  const { result } = renderHook(() => useHandleSseClientConnectionRetry(), {
    wrapper,
  });

  return { store, dispose, result };
};

const wasStreamDestroyed = (store: ReturnType<typeof createStore>) =>
  store.get(shouldDestroyEventStreamState.atom) &&
  !isDefined(store.get(sseClientState.atom));

describe('useHandleSseClientConnectionRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should stop retrying when a cookie-mode client has been signed out', async () => {
    const { store, dispose, result } = setupStore({
      isCookieAuthActive: false,
    });

    await act(() => result.current.handleSseClientConnectionRetry(0));

    expect(dispose).toHaveBeenCalledTimes(1);
    expect(wasStreamDestroyed(store)).toBe(true);
  });

  it('should keep retrying a live cookie session that has no token pair', async () => {
    const { store, dispose, result } = setupStore({
      isCookieAuthActive: true,
    });

    await act(() => result.current.handleSseClientConnectionRetry(0));

    expect(dispose).not.toHaveBeenCalled();
    expect(wasStreamDestroyed(store)).toBe(false);
  });

  it('should stop retrying past the attempt cap regardless of credential', async () => {
    const { store, dispose, result } = setupStore({
      isCookieAuthActive: true,
    });

    await act(() => result.current.handleSseClientConnectionRetry(11));

    expect(dispose).toHaveBeenCalledTimes(1);
    expect(wasStreamDestroyed(store)).toBe(true);
  });
});
