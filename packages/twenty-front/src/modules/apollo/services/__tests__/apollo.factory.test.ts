import { gql, InMemoryCache } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

import { ApolloFactory, type Options } from '@/apollo/services/apollo.factory';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { renewToken } from '@/auth/services/AuthService';
import { CUSTOM_WORKSPACE_APPLICATION_MOCK } from '@/object-metadata/hooks/__tests__/constants/CustomWorkspaceApplicationMock.test.constant';
import {
  AUTO_SELECT_FAST_MODEL_ID,
  AUTO_SELECT_SMART_MODEL_ID,
} from 'twenty-shared/constants';
import {
  type AuthTokenPair,
  WorkspaceActivationStatus,
  WorkspaceDiscoverability,
} from '~/generated-metadata/graphql';

enableFetchMocks();

jest.mock('@/auth/services/AuthService', () => {
  const initialAuthService = jest.requireActual('@/auth/services/AuthService');
  return {
    ...initialAuthService,
    renewToken: jest.fn(),
  };
});

jest.mock('@/apollo/utils/getTokenPair', () => ({
  getTokenPair: jest.fn(),
}));

jest.mock('~/utils/sleep', () => ({
  sleep: jest.fn().mockResolvedValue(undefined),
}));

const CURRENT_TOKEN_PAIR: AuthTokenPair = {
  accessOrWorkspaceAgnosticToken: { token: 'testAccessToken', expiresAt: '' },
  refreshToken: { token: 'testRefreshToken', expiresAt: '' },
};

const RENEWED_TOKEN_PAIR: AuthTokenPair = {
  accessOrWorkspaceAgnosticToken: { token: 'newAccessToken', expiresAt: '' },
  refreshToken: { token: 'newRefreshToken', expiresAt: '' },
};

const UNAUTHENTICATED_RESPONSE = JSON.stringify({
  data: {},
  errors: [{ extensions: { code: 'UNAUTHENTICATED' } }],
});

const mockOnError = jest.fn();
const mockOnNetworkError = jest.fn();
const mockOnPayloadTooLarge = jest.fn();
const mockOnTokenPairChange = jest.fn();
const mockOnUnauthenticatedError = jest.fn();

const mockWorkspaceMember = {
  id: 'workspace-member-id',
  locale: 'en',
  name: {
    firstName: 'John',
    lastName: 'Doe',
  },
  colorScheme: 'Light' as const,
  userEmail: 'userEmail',
};

const mockWorkspace = {
  id: 'workspace-id',
  metadataVersion: 1,
  allowImpersonation: false,
  activationStatus: WorkspaceActivationStatus.ACTIVE,
  billingSubscriptions: [],
  billingEntitlements: [],
  currentBillingSubscription: null,
  workspaceMembersCount: 0,
  isPublicInviteLinkEnabled: false,
  workspaceDiscoverability: WorkspaceDiscoverability.PUBLIC,
  isGoogleAuthEnabled: false,
  isMicrosoftAuthEnabled: false,
  isPasswordAuthEnabled: false,
  isCustomDomainEnabled: false,
  isGoogleAuthBypassEnabled: false,
  isPasswordAuthBypassEnabled: false,
  isMicrosoftAuthBypassEnabled: false,
  hasActivatedAndValidEnterpriseKey: false,
  hasValidSignedEnterpriseKey: false,
  hasValidEnterpriseValidityToken: false,
  subdomain: 'test',
  customDomain: 'test.com',
  workspaceUrls: {
    subdomainUrl: 'test.com',
    customUrl: 'test.com',
  },
  isTwoFactorAuthenticationEnforced: false,
  trashRetentionDays: 14,
  eventLogRetentionDays: 365 * 3,
  fastModel: AUTO_SELECT_FAST_MODEL_ID,
  smartModel: AUTO_SELECT_SMART_MODEL_ID,
  routerModel: 'auto',
  enabledAiModelIds: [],
  useRecommendedModels: true,
  isInternalMessagesImportEnabled: false,
  workspaceCustomApplication: CUSTOM_WORKSPACE_APPLICATION_MOCK,
  workspaceCustomApplicationId: CUSTOM_WORKSPACE_APPLICATION_MOCK.id,
  installedApplications: [],
};

const createMockOptions = (): Options => ({
  uri: 'http://localhost:3000',
  currentWorkspaceMember: mockWorkspaceMember,
  currentWorkspace: mockWorkspace,
  cache: new InMemoryCache(),
  isDebugMode: true,
  onError: mockOnError,
  onNetworkError: mockOnNetworkError,
  onPayloadTooLarge: mockOnPayloadTooLarge,
  onTokenPairChange: mockOnTokenPairChange,
  onUnauthenticatedError: mockOnUnauthenticatedError,
  appVersion: '1.0.0',
});

const makeRequest = async () => {
  const options = createMockOptions();
  const apolloFactory = new ApolloFactory(options);

  const client = apolloFactory.getClient();

  await client.mutate({
    mutation: gql`
      mutation TrackAnalytics(
        $type: AnalyticsType!
        $event: String
        $name: String
        $properties: JSON
      ) {
        trackAnalytics(
          type: $type
          event: $event
          name: $name
          properties: $properties
        ) {
          success
        }
      }
    `,
  });
};

describe('ApolloFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    jest.mocked(renewToken).mockReset().mockResolvedValue(RENEWED_TOKEN_PAIR);
    jest.mocked(getTokenPair).mockReset().mockReturnValue(CURRENT_TOKEN_PAIR);
  });

  it('should create an instance of ApolloFactory', () => {
    const options = createMockOptions();
    const apolloFactory = new ApolloFactory(options);
    expect(apolloFactory).toBeInstanceOf(ApolloFactory);
  });

  it('should initialize with the correct workspace member', () => {
    const options = createMockOptions();
    const apolloFactory = new ApolloFactory(options);
    expect(apolloFactory['currentWorkspaceMember']).toEqual(
      mockWorkspaceMember,
    );
  });

  it('should call onError when encountering "Unauthorized" error', async () => {
    const errors = [{ message: 'Unauthorized' }];
    fetchMock.mockResponse(() =>
      Promise.resolve({
        body: JSON.stringify({
          data: {},
          errors,
        }),
      }),
    );
    try {
      await makeRequest();
    } catch (error) {
      expect(error).toBeInstanceOf(CombinedGraphQLErrors);
      expect((error as CombinedGraphQLErrors).message).toBe('Unauthorized');
      expect(mockOnError).toHaveBeenCalledWith(errors);
    }
  }, 10000);

  it('should call onError when encountering "UNAUTHENTICATED" error', async () => {
    const errors = [
      {
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      },
    ];
    fetchMock.mockResponse(() =>
      Promise.resolve({
        body: JSON.stringify({
          data: {},
          errors,
        }),
      }),
    );

    try {
      await makeRequest();
    } catch (error) {
      expect(error).toBeInstanceOf(CombinedGraphQLErrors);
      expect((error as CombinedGraphQLErrors).message).toBe(
        'Error message not found.',
      );
      expect(mockOnError).toHaveBeenCalledWith(errors);
    }
  }, 10000);

  it('should call onNetworkError when encountering a network error', async () => {
    const errors = [
      {
        message: 'Unknown error',
      },
    ];
    fetchMock.mockResponse(() =>
      Promise.resolve({
        body: JSON.stringify({
          data: {},
          errors,
        }),
      }),
    );

    try {
      await makeRequest();
    } catch (error) {
      expect(error).toBeInstanceOf(CombinedGraphQLErrors);
      expect((error as CombinedGraphQLErrors).message).toBe('Unknown error');
      expect(mockOnError).toHaveBeenCalledWith(errors);
    }
  }, 10000);

  it('should call renewToken when encountering any error', async () => {
    fetchMock.mockReject(() => Promise.reject({ message: 'Unknown error' }));

    try {
      await makeRequest();
    } catch (error) {
      expect(error).toBeDefined();
      expect(mockOnNetworkError).toHaveBeenCalled();
    }
  }, 10000);

  it('should update workspace member when calling updateWorkspaceMember', () => {
    const options = createMockOptions();
    const apolloFactory = new ApolloFactory(options);

    const newWorkspaceMember = {
      id: 'new-workspace-member-id',
      locale: 'fr',
      name: {
        firstName: 'John',
        lastName: 'Doe',
      },
      colorScheme: 'Light' as const,
      userEmail: 'userEmail',
    };

    apolloFactory.updateWorkspaceMember(newWorkspaceMember);
    expect(apolloFactory['currentWorkspaceMember']).toEqual(newWorkspaceMember);
  });

  it('should call onPayloadTooLarge when encountering a 413 error', async () => {
    fetchMock.mockResponse(() =>
      Promise.resolve({
        status: 413,
        body: 'Payload Too Large',
      }),
    );

    try {
      await makeRequest();
    } catch {
      expect(mockOnPayloadTooLarge).toHaveBeenCalledWith(
        expect.stringContaining('Uploaded content is too large'),
      );
    }
  }, 10000);

  it('should renew tokens and replay the operation when the access token is rejected', async () => {
    fetchMock.mockResponses(
      UNAUTHENTICATED_RESPONSE,
      JSON.stringify({ data: { trackAnalytics: { success: true } } }),
    );

    await makeRequest();

    expect(renewToken).toHaveBeenCalledTimes(1);
    expect(mockOnTokenPairChange).toHaveBeenCalledWith(RENEWED_TOKEN_PAIR);
    expect(mockOnUnauthenticatedError).not.toHaveBeenCalled();
  });

  it('should trigger unauthenticated error when the server rejects the refresh token', async () => {
    fetchMock.mockResponse(UNAUTHENTICATED_RESPONSE);
    jest.mocked(renewToken).mockRejectedValue(
      new CombinedGraphQLErrors({
        errors: [
          {
            message: 'This refresh token has been revoked.',
            extensions: { code: 'FORBIDDEN' },
          },
        ],
      }),
    );

    await expect(makeRequest()).rejects.toBeInstanceOf(CombinedGraphQLErrors);

    expect(renewToken).toHaveBeenCalledTimes(1);
    expect(mockOnUnauthenticatedError).toHaveBeenCalledTimes(1);
    expect(mockOnTokenPairChange).not.toHaveBeenCalled();
  });

  it('should keep the session when token renewal fails on a network error', async () => {
    fetchMock.mockResponse(UNAUTHENTICATED_RESPONSE);
    jest.mocked(renewToken).mockRejectedValue(new Error('Failed to fetch'));

    await expect(makeRequest()).rejects.toBeInstanceOf(CombinedGraphQLErrors);

    expect(renewToken).toHaveBeenCalledTimes(4);
    expect(mockOnUnauthenticatedError).not.toHaveBeenCalled();
    expect(mockOnTokenPairChange).not.toHaveBeenCalled();
  });

  it('should keep the session when token renewal fails on a server error', async () => {
    fetchMock.mockResponse(UNAUTHENTICATED_RESPONSE);
    jest.mocked(renewToken).mockRejectedValue(
      new CombinedGraphQLErrors({
        errors: [
          {
            message: 'Internal server error',
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
          },
        ],
      }),
    );

    await expect(makeRequest()).rejects.toBeInstanceOf(CombinedGraphQLErrors);

    expect(renewToken).toHaveBeenCalledTimes(1);
    expect(mockOnUnauthenticatedError).not.toHaveBeenCalled();
    expect(mockOnTokenPairChange).not.toHaveBeenCalled();
  });

  it('should trigger unauthenticated error without renewing when the stored pair has no refresh token', async () => {
    jest.mocked(getTokenPair).mockReturnValue({
      accessOrWorkspaceAgnosticToken: {
        token: 'testAccessToken',
        expiresAt: '',
      },
    } as unknown as AuthTokenPair);
    fetchMock.mockResponse(UNAUTHENTICATED_RESPONSE);

    await expect(makeRequest()).rejects.toBeInstanceOf(CombinedGraphQLErrors);

    expect(renewToken).not.toHaveBeenCalled();
    expect(mockOnUnauthenticatedError).toHaveBeenCalledTimes(1);
  });
});
