import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useFrontComponentApplicationTokenPair } from '@/front-components/hooks/useFrontComponentApplicationTokenPair';
import { frontComponentApplicationTokenPairFamilyState } from '@/front-components/states/frontComponentApplicationTokenPairFamilyState';
import { type FrontComponentApplicationTokenPair } from '@/front-components/types/FrontComponentApplicationTokenPair';
import {
  type ApplicationTokenPair,
  GenerateFrontComponentApplicationTokenPairDocument,
  RenewApplicationTokenDocument,
} from '~/generated-metadata/graphql';

const mockMutate = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => ({
    mutate: mockMutate,
  }),
}));

const APPLICATION_ID = 'application-test-id';
const OTHER_APPLICATION_ID = 'other-application-test-id';

const getDateInOneHour = () =>
  new Date(Date.now() + 60 * 60 * 1000).toISOString();
const getDateInOneMinute = () => new Date(Date.now() + 60 * 1000).toISOString();
const getTimestampOneMinuteAgo = () => Date.now() - 60 * 1000;

const buildTokenPair = ({
  accessToken,
  refreshToken,
  accessTokenExpiresAt = getDateInOneHour(),
}: {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: string;
}): ApplicationTokenPair => ({
  __typename: 'ApplicationTokenPair',
  applicationAccessToken: {
    __typename: 'AuthToken',
    token: accessToken,
    expiresAt: accessTokenExpiresAt,
  },
  applicationRefreshToken: {
    __typename: 'AuthToken',
    token: refreshToken,
    expiresAt: getDateInOneHour(),
  },
});

const buildStoredTokenPair = ({
  accessTokenExpiresAt,
  obtainedAt = getTimestampOneMinuteAgo(),
}: {
  accessTokenExpiresAt?: string;
  obtainedAt?: number;
} = {}): FrontComponentApplicationTokenPair => ({
  ...buildTokenPair({
    accessToken: 'stored-access',
    refreshToken: 'stored-refresh',
    accessTokenExpiresAt,
  }),
  obtainedAt,
});

const mockGeneratedTokenPair = (accessToken = 'generated-access') => ({
  data: {
    generateFrontComponentApplicationTokenPair: buildTokenPair({
      accessToken,
      refreshToken: 'generated-refresh',
    }),
  },
});

const mockRenewedTokenPair = () => ({
  data: {
    renewApplicationToken: buildTokenPair({
      accessToken: 'renewed-access',
      refreshToken: 'renewed-refresh',
    }),
  },
});

const getMutationCalls = (mutation: unknown) =>
  mockMutate.mock.calls.filter(([options]) => options.mutation === mutation);

const renderUseFrontComponentApplicationTokenPair = (
  store: ReturnType<typeof createStore>,
) =>
  renderHook(() => useFrontComponentApplicationTokenPair(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>{children}</JotaiProvider>
    ),
  });

const getStoredTokenPair = (store: ReturnType<typeof createStore>) =>
  store.get(
    frontComponentApplicationTokenPairFamilyState.atomFamily(APPLICATION_ID),
  );

const setStoredTokenPair = (
  store: ReturnType<typeof createStore>,
  applicationTokenPair: FrontComponentApplicationTokenPair,
) =>
  store.set(
    frontComponentApplicationTokenPairFamilyState.atomFamily(APPLICATION_ID),
    applicationTokenPair,
  );

describe('useFrontComponentApplicationTokenPair', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadFrontComponentApplicationTokenPair', () => {
    it('should generate a single token pair for concurrent loads of the same application', async () => {
      const store = createStore();
      mockMutate.mockResolvedValue(mockGeneratedTokenPair());

      const { result } = renderUseFrontComponentApplicationTokenPair(store);

      let applicationTokenPairs: FrontComponentApplicationTokenPair[] = [];

      await act(async () => {
        applicationTokenPairs = await Promise.all([
          result.current.loadFrontComponentApplicationTokenPair(APPLICATION_ID),
          result.current.loadFrontComponentApplicationTokenPair(APPLICATION_ID),
          result.current.loadFrontComponentApplicationTokenPair(APPLICATION_ID),
        ]);
      });

      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          mutation: GenerateFrontComponentApplicationTokenPairDocument,
          variables: { applicationId: APPLICATION_ID },
        }),
      );
      expect(
        applicationTokenPairs.map(
          (applicationTokenPair) =>
            applicationTokenPair.applicationAccessToken.token,
        ),
      ).toEqual(['generated-access', 'generated-access', 'generated-access']);
      expect(getStoredTokenPair(store)?.applicationAccessToken.token).toBe(
        'generated-access',
      );
    });

    it('should generate one token pair per application', async () => {
      const store = createStore();
      mockMutate.mockResolvedValue(mockGeneratedTokenPair());

      const { result } = renderUseFrontComponentApplicationTokenPair(store);

      await act(async () => {
        await Promise.all([
          result.current.loadFrontComponentApplicationTokenPair(APPLICATION_ID),
          result.current.loadFrontComponentApplicationTokenPair(
            OTHER_APPLICATION_ID,
          ),
        ]);
      });

      expect(
        getMutationCalls(
          GenerateFrontComponentApplicationTokenPairDocument,
        ).map(([options]) => options.variables.applicationId),
      ).toEqual([APPLICATION_ID, OTHER_APPLICATION_ID]);
    });

    it('should reuse the stored token pair when its access token is still valid', async () => {
      const store = createStore();
      const storedTokenPair = buildStoredTokenPair();
      setStoredTokenPair(store, storedTokenPair);

      const { result } = renderUseFrontComponentApplicationTokenPair(store);

      let applicationTokenPair: FrontComponentApplicationTokenPair | undefined;

      await act(async () => {
        applicationTokenPair =
          await result.current.loadFrontComponentApplicationTokenPair(
            APPLICATION_ID,
          );
      });

      expect(applicationTokenPair).toBe(storedTokenPair);
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('should renew the stored token pair when its access token is about to expire', async () => {
      const store = createStore();
      setStoredTokenPair(
        store,
        buildStoredTokenPair({ accessTokenExpiresAt: getDateInOneMinute() }),
      );
      mockMutate.mockResolvedValue(mockRenewedTokenPair());

      const { result } = renderUseFrontComponentApplicationTokenPair(store);

      let applicationTokenPair: FrontComponentApplicationTokenPair | undefined;

      await act(async () => {
        applicationTokenPair =
          await result.current.loadFrontComponentApplicationTokenPair(
            APPLICATION_ID,
          );
      });

      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          mutation: RenewApplicationTokenDocument,
          variables: { applicationRefreshToken: 'stored-refresh' },
        }),
      );
      expect(applicationTokenPair?.applicationAccessToken.token).toBe(
        'renewed-access',
      );
    });
  });

  describe('requestApplicationAccessTokenRefresh', () => {
    it('should renew once for concurrent refresh requests of the same application', async () => {
      const store = createStore();
      setStoredTokenPair(store, buildStoredTokenPair());
      mockMutate.mockResolvedValue(mockRenewedTokenPair());

      const { result } = renderUseFrontComponentApplicationTokenPair(store);

      let accessTokens: string[] = [];

      await act(async () => {
        accessTokens = await Promise.all(
          Array.from({ length: 40 }, () =>
            result.current.requestApplicationAccessTokenRefresh(APPLICATION_ID),
          ),
        );
      });

      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(new Set(accessTokens)).toEqual(new Set(['renewed-access']));
      expect(getStoredTokenPair(store)?.applicationAccessToken.token).toBe(
        'renewed-access',
      );
    });

    it('should return the stored access token when it was just renewed', async () => {
      const store = createStore();
      setStoredTokenPair(
        store,
        buildStoredTokenPair({ obtainedAt: Date.now() }),
      );

      const { result } = renderUseFrontComponentApplicationTokenPair(store);

      let accessToken: string | undefined;

      await act(async () => {
        accessToken =
          await result.current.requestApplicationAccessTokenRefresh(
            APPLICATION_ID,
          );
      });

      expect(accessToken).toBe('stored-access');
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('should generate a new token pair when the refresh token is rejected', async () => {
      const store = createStore();
      setStoredTokenPair(store, buildStoredTokenPair());
      mockMutate.mockImplementation(async ({ mutation }) => {
        if (mutation === RenewApplicationTokenDocument) {
          throw new CombinedGraphQLErrors({
            errors: [
              {
                message: 'Refresh token expired',
                extensions: {
                  subCode: 'APPLICATION_REFRESH_TOKEN_INVALID_OR_EXPIRED',
                },
              },
            ],
          });
        }

        return mockGeneratedTokenPair('regenerated-access');
      });

      const { result } = renderUseFrontComponentApplicationTokenPair(store);

      let accessTokens: string[] = [];

      await act(async () => {
        accessTokens = await Promise.all([
          result.current.requestApplicationAccessTokenRefresh(APPLICATION_ID),
          result.current.requestApplicationAccessTokenRefresh(APPLICATION_ID),
        ]);
      });

      expect(accessTokens).toEqual([
        'regenerated-access',
        'regenerated-access',
      ]);
      expect(getMutationCalls(RenewApplicationTokenDocument)).toHaveLength(1);
      expect(
        getMutationCalls(GenerateFrontComponentApplicationTokenPairDocument),
      ).toHaveLength(1);
    });

    it('should re-throw other errors and retry on the next request', async () => {
      const store = createStore();
      setStoredTokenPair(store, buildStoredTokenPair());
      mockMutate
        .mockRejectedValueOnce(new Error('Network failure'))
        .mockResolvedValueOnce(mockRenewedTokenPair());

      const { result } = renderUseFrontComponentApplicationTokenPair(store);

      await expect(
        result.current.requestApplicationAccessTokenRefresh(APPLICATION_ID),
      ).rejects.toThrow('Network failure');

      expect(
        getMutationCalls(GenerateFrontComponentApplicationTokenPairDocument),
      ).toHaveLength(0);

      let accessToken: string | undefined;

      await act(async () => {
        accessToken =
          await result.current.requestApplicationAccessTokenRefresh(
            APPLICATION_ID,
          );
      });

      expect(accessToken).toBe('renewed-access');
      expect(mockMutate).toHaveBeenCalledTimes(2);
    });
  });
});
