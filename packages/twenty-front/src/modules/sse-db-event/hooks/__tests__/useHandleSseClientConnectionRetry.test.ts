import { act, renderHook } from '@testing-library/react';
import { type Client } from 'graphql-sse';
import { createStore, Provider } from 'jotai';
import { createElement, type ReactNode } from 'react';

import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { type AuthTokenPair } from '~/generated-metadata/graphql';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { useHandleSseClientConnectionRetry } from '@/sse-db-event/hooks/useHandleSseClientConnectionRetry';

jest.mock('~/utils/sleep', () => ({
  sleep: jest.fn().mockResolvedValue(undefined),
}));

const ensureTokenRenewedMock = jest.fn();

jest.mock('@/auth/utils/ensureTokenRenewed', () => ({
  ensureTokenRenewed: (...args: unknown[]) => ensureTokenRenewedMock(...args),
}));

const buildTokenPair = (expiresAt: Date): AuthTokenPair => ({
  accessOrWorkspaceAgnosticToken: {
    token: 'access-token',
    expiresAt: expiresAt.toISOString(),
  },
  refreshToken: {
    token: 'refresh-token',
    expiresAt: expiresAt.toISOString(),
  },
});

// The hook only ever calls dispose, but the atom holds a full Client, so the
// unused members are stubbed rather than cast away.
const buildSseClient = (dispose: () => void): Client => ({
  subscribe: () => () => {},
  iterate: async function* () {},
  dispose,
});

const setupStore = ({
  isCookieAuthActive,
  tokenPair,
}: {
  isCookieAuthActive: boolean;
  tokenPair: AuthTokenPair | null;
}) => {
  const store = createStore();
  const dispose = jest.fn();

  store.set(sseClientState.atom, buildSseClient(dispose));
  store.set(shouldDestroyEventStreamState.atom, false);
  store.set(isCookieAuthActiveState.atom, isCookieAuthActive);
  store.set(tokenPairState.atom, tokenPair);

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(Provider, { store }, children);

  const { result } = renderHook(() => useHandleSseClientConnectionRetry(), {
    wrapper,
  });

  return { store, dispose, result };
};

const wasStreamDestroyed = (store: ReturnType<typeof createStore>) =>
  store.get(shouldDestroyEventStreamState.atom) &&
  store.get(sseClientState.atom) === null;

describe('useHandleSseClientConnectionRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureTokenRenewedMock.mockResolvedValue(true);
  });

  it('should stop retrying when a cookie-mode client has been signed out', async () => {
    const { store, dispose, result } = setupStore({
      isCookieAuthActive: false,
      tokenPair: null,
    });

    await act(() => result.current.handleSseClientConnectionRetry(0));

    expect(dispose).toHaveBeenCalledTimes(1);
    expect(wasStreamDestroyed(store)).toBe(true);
  });

  it('should keep retrying a live cookie session that has no token pair', async () => {
    const { store, dispose, result } = setupStore({
      isCookieAuthActive: true,
      tokenPair: null,
    });

    await act(() => result.current.handleSseClientConnectionRetry(0));

    expect(dispose).not.toHaveBeenCalled();
    expect(wasStreamDestroyed(store)).toBe(false);
    // Nothing to renew when the cookie is the credential.
    expect(ensureTokenRenewedMock).not.toHaveBeenCalled();
  });

  it('should stop retrying past the attempt cap regardless of credential', async () => {
    const { store, dispose, result } = setupStore({
      isCookieAuthActive: true,
      tokenPair: null,
    });

    await act(() => result.current.handleSseClientConnectionRetry(11));

    expect(dispose).toHaveBeenCalledTimes(1);
    expect(wasStreamDestroyed(store)).toBe(true);
  });

  it('should renew an expired token in token mode and stop when renewal fails', async () => {
    ensureTokenRenewedMock.mockResolvedValue(false);

    const { store, dispose, result } = setupStore({
      isCookieAuthActive: false,
      tokenPair: buildTokenPair(new Date(Date.now() - 1000)),
    });

    await act(() => result.current.handleSseClientConnectionRetry(0));

    expect(ensureTokenRenewedMock).toHaveBeenCalledTimes(1);
    expect(ensureTokenRenewedMock).toHaveBeenCalledWith(store);
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(wasStreamDestroyed(store)).toBe(true);
  });

  it('should keep retrying in token mode while the token is still valid', async () => {
    const { store, dispose, result } = setupStore({
      isCookieAuthActive: false,
      tokenPair: buildTokenPair(new Date(Date.now() + 60_000)),
    });

    await act(() => result.current.handleSseClientConnectionRetry(0));

    expect(ensureTokenRenewedMock).not.toHaveBeenCalled();
    expect(dispose).not.toHaveBeenCalled();
    expect(wasStreamDestroyed(store)).toBe(false);
  });
});
