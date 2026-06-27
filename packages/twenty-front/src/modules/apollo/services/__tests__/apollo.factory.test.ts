import { gql, InMemoryCache } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

import {
  AUTO_SELECT_FAST_MODEL_ID,
  AUTO_SELECT_SMART_MODEL_ID,
} from 'twenty-shared/constants';
import { ApolloFactory, type Options } from '@/apollo/services/apollo.factory';
import { CUSTOM_WORKSPACE_APPLICATION_MOCK } from '@/object-metadata/hooks/__tests__/constants/CustomWorkspaceApplicationMock.test.constant';
import { WorkspaceActivationStatus } from '~/generated-metadata/graphql';

const mockCaptureException = jest.fn();
const mockCaptureMessage = jest.fn();

enableFetchMocks();

jest.mock('@sentry/react', () => ({
  captureException: mockCaptureException,
  captureMessage: mockCaptureMessage,
  withScope: (
    cb: (scope: {
      setExtra: jest.Mock;
      setFingerprint: jest.Mock;
      setLevel: jest.Mock;
      setTag: jest.Mock;
    }) => void,
  ) =>
    cb({
      setExtra: jest.fn(),
      setFingerprint: jest.fn(),
      setLevel: jest.fn(),
      setTag: jest.fn(),
    }),
}));

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

jest.mock('@/apollo/utils/getTokenPair', () => ({
  getTokenPair: jest.fn().mockReturnValue({
    accessOrWorkspaceAgnosticToken: { token: 'testAccessToken', expiresAt: '' },
    refreshToken: { token: 'testRefreshToken', expiresAt: '' },
  }),
}));

const mockOnError = jest.fn();
const mockOnNetworkError = jest.fn();
const mockOnPayloadTooLarge = jest.fn();
const mockOnAppVersionMismatch = jest.fn();

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
  onAppVersionMismatch: mockOnAppVersionMismatch,
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

  it('should notify UI and avoid Sentry when schema version mismatches', async () => {
    const errors = [
      {
        message: 'Schema version mismatch.',
        extensions: {
          code: 'SCHEMA_VERSION_MISMATCH',
          userFriendlyMessage:
            'Your workspace has been updated with a new data model. Please refresh the page.',
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
      expect(mockOnError).toHaveBeenCalledWith(errors);
      expect(mockOnAppVersionMismatch).toHaveBeenCalledWith(
        errors[0].extensions.userFriendlyMessage,
      );
      expect(mockCaptureException).not.toHaveBeenCalled();
      expect(mockCaptureMessage).not.toHaveBeenCalled();
    }
  }, 10000);

  it('should capture GraphQL validation failures as warning messages', async () => {
    const errors = [
      {
        message: 'Cannot query field invalidField on type Query.',
        extensions: {
          code: 'GRAPHQL_VALIDATION_FAILED',
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
      expect(mockCaptureMessage).toHaveBeenCalledWith(errors[0].message);
      expect(mockCaptureException).not.toHaveBeenCalled();
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
