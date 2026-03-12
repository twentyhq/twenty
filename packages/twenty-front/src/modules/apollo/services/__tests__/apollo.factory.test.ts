import { gql, InMemoryCache } from '@apollo/client';
import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

import { DEFAULT_FAST_MODEL } from '@/ai/constants/DefaultFastModel';
import { DEFAULT_SMART_MODEL } from '@/ai/constants/DefaultSmartModel';
import { ApolloFactory, type Options } from '@/apollo/services/apollo.factory';
import { CUSTOM_WORKSPACE_APPLICATION_MOCK } from '@/object-metadata/hooks/__tests__/constants/CustomWorkspaceApplicationMock.test.constant';
import { WorkspaceActivationStatus } from '~/generated-metadata/graphql';

enableFetchMocks();

jest.mock('@/auth/services/AuthService', () => {
  const initialAuthService = jest.requireActual('@/auth/services/AuthService');
  return {
    ...initialAuthService,
    renewToken: jest.fn().mockReturnValue(
      Promise.resolve({
        accessOrWorkspaceAgnosticToken: {
          token: 'newAccessToken',
          expiresAt: '',
        },
        refreshToken: { token: 'newRefreshToken', expiresAt: '' },
      }),
    ),
  };
});

const mockOnError = jest.fn();
const mockOnNetworkError = jest.fn();
const mockOnPayloadTooLarge = jest.fn();

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
  isGoogleAuthEnabled: false,
  isMicrosoftAuthEnabled: false,
  isPasswordAuthEnabled: false,
  isCustomDomainEnabled: false,
  isGoogleAuthBypassEnabled: false,
  isPasswordAuthBypassEnabled: false,
  isMicrosoftAuthBypassEnabled: false,
  hasValidEnterpriseKey: false,
  subdomain: 'test',
  customDomain: 'test.com',
  workspaceUrls: {
    subdomainUrl: 'test.com',
    customUrl: 'test.com',
  },
  isTwoFactorAuthenticationEnforced: false,
  trashRetentionDays: 14,
  eventLogRetentionDays: 365 * 3,
  fastModel: DEFAULT_FAST_MODEL,
  smartModel: DEFAULT_SMART_MODEL,
  routerModel: 'auto',
  autoEnableNewAiModels: true,
  disabledAiModelIds: [],
  enabledAiModelIds: [],
  useRecommendedModels: true,
  workspaceCustomApplication: CUSTOM_WORKSPACE_APPLICATION_MOCK,
  workspaceCustomApplicationId: CUSTOM_WORKSPACE_APPLICATION_MOCK.id,
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
      expect((error as CombinedGraphQLErrors).message).toBe('Error message not found.');
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
});
