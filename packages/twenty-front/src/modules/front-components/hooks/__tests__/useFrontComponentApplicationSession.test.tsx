import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useFrontComponentApplicationSession } from '@/front-components/hooks/useFrontComponentApplicationSession';
import { frontComponentApplicationSessionFamilyState } from '@/front-components/states/frontComponentApplicationSessionFamilyState';
import { type FrontComponentApplicationSession } from '@/front-components/types/FrontComponentApplicationSession';
import {
  type ApplicationTokenPair,
  GenerateFrontComponentApplicationSessionDocument,
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
const APPLICATION_VARIABLES = { PUBLIC_API_URL: 'https://example.com' };

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

const buildApplicationSession = ({
  accessTokenExpiresAt,
  tokenPairObtainedAt = getTimestampOneMinuteAgo(),
}: {
  accessTokenExpiresAt?: string;
  tokenPairObtainedAt?: number;
} = {}): FrontComponentApplicationSession => ({
  applicationTokenPair: buildTokenPair({
    accessToken: 'stored-access',
    refreshToken: 'stored-refresh',
    accessTokenExpiresAt,
  }),
  applicationVariables: APPLICATION_VARIABLES,
  tokenPairObtainedAt,
});

const mockGeneratedSession = (accessToken = 'generated-access') => ({
  data: {
    generateFrontComponentApplicationSession: {
      applicationTokenPair: buildTokenPair({
        accessToken,
        refreshToken: 'generated-refresh',
      }),
      applicationVariables: APPLICATION_VARIABLES,
    },
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

const renderUseFrontComponentApplicationSession = (
  store: ReturnType<typeof createStore>,
) =>
  renderHook(() => useFrontComponentApplicationSession(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>{children}</JotaiProvider>
    ),
  });

const getStoredApplicationSession = (
  store: ReturnType<typeof createStore>,
  applicationId = APPLICATION_ID,
) =>
  store.get(
    frontComponentApplicationSessionFamilyState.atomFamily(applicationId),
  );

const storeApplicationSession = (
  store: ReturnType<typeof createStore>,
  applicationSession: FrontComponentApplicationSession,
) =>
  store.set(
    frontComponentApplicationSessionFamilyState.atomFamily(APPLICATION_ID),
    applicationSession,
  );

describe('useFrontComponentApplicationSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadFrontComponentApplicationSession', () => {
    it('should generate a single session for concurrent loads of the same application', async () => {
      const store = createStore();
      mockMutate.mockResolvedValue(mockGeneratedSession());

      const { result } = renderUseFrontComponentApplicationSession(store);

      let applicationSessions: FrontComponentApplicationSession[] = [];

      await act(async () => {
        applicationSessions = await Promise.all([
          result.current.loadFrontComponentApplicationSession(APPLICATION_ID),
          result.current.loadFrontComponentApplicationSession(APPLICATION_ID),
          result.current.loadFrontComponentApplicationSession(APPLICATION_ID),
        ]);
      });

      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          mutation: GenerateFrontComponentApplicationSessionDocument,
          variables: { applicationId: APPLICATION_ID },
        }),
      );
      expect(
        applicationSessions.map(
          (applicationSession) =>
            applicationSession.applicationTokenPair.applicationAccessToken
              .token,
        ),
      ).toEqual(['generated-access', 'generated-access', 'generated-access']);
      expect(getStoredApplicationSession(store)).toMatchObject({
        applicationVariables: APPLICATION_VARIABLES,
      });
    });

    it('should generate one session per application', async () => {
      const store = createStore();
      mockMutate.mockResolvedValue(mockGeneratedSession());

      const { result } = renderUseFrontComponentApplicationSession(store);

      await act(async () => {
        await Promise.all([
          result.current.loadFrontComponentApplicationSession(APPLICATION_ID),
          result.current.loadFrontComponentApplicationSession(
            OTHER_APPLICATION_ID,
          ),
        ]);
      });

      expect(
        getMutationCalls(GenerateFrontComponentApplicationSessionDocument).map(
          ([options]) => options.variables.applicationId,
        ),
      ).toEqual([APPLICATION_ID, OTHER_APPLICATION_ID]);
    });

    it('should reuse the stored session when its access token is still valid', async () => {
      const store = createStore();
      const storedApplicationSession = buildApplicationSession();
      storeApplicationSession(store, storedApplicationSession);

      const { result } = renderUseFrontComponentApplicationSession(store);

      let applicationSession: FrontComponentApplicationSession | undefined;

      await act(async () => {
        applicationSession =
          await result.current.loadFrontComponentApplicationSession(
            APPLICATION_ID,
          );
      });

      expect(applicationSession).toBe(storedApplicationSession);
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('should renew the stored session when its access token is about to expire', async () => {
      const store = createStore();
      storeApplicationSession(
        store,
        buildApplicationSession({ accessTokenExpiresAt: getDateInOneMinute() }),
      );
      mockMutate.mockResolvedValue(mockRenewedTokenPair());

      const { result } = renderUseFrontComponentApplicationSession(store);

      let applicationSession: FrontComponentApplicationSession | undefined;

      await act(async () => {
        applicationSession =
          await result.current.loadFrontComponentApplicationSession(
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
      expect(
        applicationSession?.applicationTokenPair.applicationAccessToken.token,
      ).toBe('renewed-access');
      expect(applicationSession?.applicationVariables).toEqual(
        APPLICATION_VARIABLES,
      );
    });
  });

  describe('requestApplicationAccessTokenRefresh', () => {
    it('should renew once for concurrent refresh requests of the same application', async () => {
      const store = createStore();
      storeApplicationSession(store, buildApplicationSession());
      mockMutate.mockResolvedValue(mockRenewedTokenPair());

      const { result } = renderUseFrontComponentApplicationSession(store);

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
      expect(
        getStoredApplicationSession(store)?.applicationTokenPair
          .applicationAccessToken.token,
      ).toBe('renewed-access');
    });

    it('should return the stored access token when it was just renewed', async () => {
      const store = createStore();
      storeApplicationSession(
        store,
        buildApplicationSession({ tokenPairObtainedAt: Date.now() }),
      );

      const { result } = renderUseFrontComponentApplicationSession(store);

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

    it('should generate a new session when the refresh token is rejected', async () => {
      const store = createStore();
      storeApplicationSession(store, buildApplicationSession());
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

        return mockGeneratedSession('regenerated-access');
      });

      const { result } = renderUseFrontComponentApplicationSession(store);

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
        getMutationCalls(GenerateFrontComponentApplicationSessionDocument),
      ).toHaveLength(1);
    });

    it('should re-throw other errors and retry on the next request', async () => {
      const store = createStore();
      storeApplicationSession(store, buildApplicationSession());
      mockMutate
        .mockRejectedValueOnce(new Error('Network failure'))
        .mockResolvedValueOnce(mockRenewedTokenPair());

      const { result } = renderUseFrontComponentApplicationSession(store);

      await expect(
        result.current.requestApplicationAccessTokenRefresh(APPLICATION_ID),
      ).rejects.toThrow('Network failure');

      expect(
        getMutationCalls(GenerateFrontComponentApplicationSessionDocument),
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
