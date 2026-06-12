import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { act, renderHook } from '@testing-library/react';
import { atom, createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useRequestApplicationTokenRefresh } from '@/front-components/hooks/useRequestApplicationTokenRefresh';
import { type ApplicationTokenPair } from '~/generated-metadata/graphql';

const mockQuery = jest.fn();
const mockMutate = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => ({
    query: mockQuery,
    mutate: mockMutate,
  }),
}));

const tokenPairAtom = atom<ApplicationTokenPair | null>(null);

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState',
  () => ({
    useAtomComponentStateCallbackState: () => tokenPairAtom,
  }),
);

const FRONT_COMPONENT_ID = 'fc-test-id';

const buildTokenPair = (
  accessToken = 'access-token-1',
  refreshToken = 'refresh-token-1',
): ApplicationTokenPair => ({
  __typename: 'ApplicationTokenPair',
  applicationAccessToken: {
    __typename: 'AuthToken',
    token: accessToken,
    expiresAt: '2099-01-01T00:00:00.000Z',
  },
  applicationRefreshToken: {
    __typename: 'AuthToken',
    token: refreshToken,
    expiresAt: '2099-01-01T00:00:00.000Z',
  },
});

const getWrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

describe('useRequestApplicationTokenRefresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw when application token pair is not initialized in the store', async () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const { result } = renderHook(
      () =>
        useRequestApplicationTokenRefresh({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      { wrapper },
    );

    await expect(
      act(() => result.current.requestAccessTokenRefresh()),
    ).rejects.toThrow(
      'Application token pair must be initialized before requesting a refresh',
    );
  });

  it('should renew token via mutation and update the store', async () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const initialTokenPair = buildTokenPair('old-access', 'old-refresh');
    store.set(tokenPairAtom, initialTokenPair);

    const renewedTokenPair = buildTokenPair(
      'new-access-token',
      'new-refresh-token',
    );

    mockMutate.mockResolvedValue({
      data: { renewApplicationToken: renewedTokenPair },
    });

    const { result } = renderHook(
      () =>
        useRequestApplicationTokenRefresh({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      { wrapper },
    );

    let accessToken: string | undefined;

    await act(async () => {
      accessToken = await result.current.requestAccessTokenRefresh();
    });

    expect(accessToken).toBe('new-access-token');
    expect(store.get(tokenPairAtom)).toEqual(renewedTokenPair);
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          applicationRefreshToken: 'old-refresh',
        },
      }),
    );
  });

  it('should fallback to refetching front component when refresh token is expired', async () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const initialTokenPair = buildTokenPair('old-access', 'expired-refresh');
    store.set(tokenPairAtom, initialTokenPair);

    const expiredError = new CombinedGraphQLErrors({
      errors: [
        {
          message: 'Refresh token expired',
          extensions: {
            subCode: 'APPLICATION_REFRESH_TOKEN_INVALID_OR_EXPIRED',
          },
        },
      ],
    });

    mockMutate.mockRejectedValue(expiredError);

    const refetchedTokenPair = buildTokenPair(
      'refetched-access',
      'refetched-refresh',
    );

    mockQuery.mockResolvedValue({
      data: {
        frontComponent: {
          applicationTokenPair: refetchedTokenPair,
        },
      },
    });

    const { result } = renderHook(
      () =>
        useRequestApplicationTokenRefresh({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      { wrapper },
    );

    let accessToken: string | undefined;

    await act(async () => {
      accessToken = await result.current.requestAccessTokenRefresh();
    });

    expect(accessToken).toBe('refetched-access');
    expect(store.get(tokenPairAtom)).toEqual(refetchedTokenPair);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { id: FRONT_COMPONENT_ID },
        fetchPolicy: 'network-only',
      }),
    );
  });

  it('should re-throw non-token-expiry errors from the mutation', async () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const initialTokenPair = buildTokenPair();
    store.set(tokenPairAtom, initialTokenPair);

    const networkError = new Error('Network failure');
    mockMutate.mockRejectedValue(networkError);

    const { result } = renderHook(
      () =>
        useRequestApplicationTokenRefresh({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      { wrapper },
    );

    await expect(
      act(() => result.current.requestAccessTokenRefresh()),
    ).rejects.toThrow('Network failure');

    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('should throw when refetch returns no token pair', async () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const initialTokenPair = buildTokenPair('old-access', 'expired-refresh');
    store.set(tokenPairAtom, initialTokenPair);

    const expiredError = new CombinedGraphQLErrors({
      errors: [
        {
          message: 'Refresh token expired',
          extensions: {
            subCode: 'APPLICATION_REFRESH_TOKEN_INVALID_OR_EXPIRED',
          },
        },
      ],
    });

    mockMutate.mockRejectedValue(expiredError);

    mockQuery.mockResolvedValue({
      data: { frontComponent: { applicationTokenPair: null } },
    });

    const { result } = renderHook(
      () =>
        useRequestApplicationTokenRefresh({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      { wrapper },
    );

    await expect(
      act(() => result.current.requestAccessTokenRefresh()),
    ).rejects.toThrow('Failed to refetch application token pair');
  });
});
