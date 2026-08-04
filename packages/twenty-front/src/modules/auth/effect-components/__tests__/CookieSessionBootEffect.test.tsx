import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { type ReactNode } from 'react';

import { CookieSessionBootEffect } from '@/auth/effect-components/CookieSessionBootEffect';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isCookieSessionEnabledState } from '@/client-config/states/isCookieSessionEnabledState';

const mockQuery = jest.fn();
const mockEnsureTokenRenewed = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({
    query: mockQuery,
    mutate: jest.fn(),
  }),
}));

jest.mock('@/auth/utils/ensureTokenRenewed', () => ({
  ensureTokenRenewed: (...args: unknown[]) => mockEnsureTokenRenewed(...args),
}));

const buildTokenPair = () => ({
  accessOrWorkspaceAgnosticToken: {
    token: 'access',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  },
  refreshToken: {
    token: 'refresh',
    expiresAt: new Date(Date.now() + 600_000).toISOString(),
  },
});

// A request carrying no credential is refused as FORBIDDEN, not UNAUTHENTICATED.
const buildForbiddenError = () =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [
      {
        message: 'Forbidden resource',
        extensions: { code: 'FORBIDDEN' },
      },
    ],
  });

const renderBootEffect = () => {
  const store = createStore();

  store.set(clientConfigApiStatusState.atom, {
    isLoadedOnce: true,
    isLoading: false,
    isErrored: false,
    isSaved: false,
  });
  store.set(isCookieSessionEnabledState.atom, true);
  store.set(isCookieAuthActiveState.atom, false);
  store.set(tokenPairState.atom, buildTokenPair());

  renderHook(() => CookieSessionBootEffect(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>{children}</JotaiProvider>
    ),
  });

  return store;
};

describe('CookieSessionBootEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnsureTokenRenewed.mockResolvedValue(true);
  });

  it('should renew once so the server can set the cookie when the probe is refused', async () => {
    mockQuery
      .mockRejectedValueOnce(buildForbiddenError())
      .mockResolvedValueOnce({ data: { currentUser: { id: 'user-id' } } });

    const store = renderBootEffect();

    await waitFor(() => {
      expect(mockEnsureTokenRenewed).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(store.get(isCookieAuthActiveState.atom)).toBe(true);
    });

    expect(store.get(tokenPairState.atom)).toBeNull();
  });

  it('should stay retryable when the probe fails for an unrelated reason', async () => {
    mockQuery.mockRejectedValue(
      new CombinedGraphQLErrors({
        data: null,
        errors: [
          {
            message: 'Something broke in a resolver',
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
          },
        ],
      }),
    );

    const store = renderBootEffect();

    await waitFor(() => {
      expect(mockQuery).toHaveBeenCalled();
    });

    expect(mockEnsureTokenRenewed).not.toHaveBeenCalled();
    expect(store.get(isCookieAuthActiveState.atom)).toBe(false);
    expect(store.get(tokenPairState.atom)).not.toBeNull();
  });

  it('should not renew when the server cannot be reached', async () => {
    mockQuery.mockRejectedValue(new Error('Network request failed'));

    const store = renderBootEffect();

    await waitFor(() => {
      expect(mockQuery).toHaveBeenCalled();
    });

    expect(mockEnsureTokenRenewed).not.toHaveBeenCalled();
    expect(store.get(isCookieAuthActiveState.atom)).toBe(false);
  });

  it('should switch straight over when the cookie already authenticates', async () => {
    mockQuery.mockResolvedValue({ data: { currentUser: { id: 'user-id' } } });

    const store = renderBootEffect();

    await waitFor(() => {
      expect(store.get(isCookieAuthActiveState.atom)).toBe(true);
    });

    expect(mockEnsureTokenRenewed).not.toHaveBeenCalled();
  });
});
