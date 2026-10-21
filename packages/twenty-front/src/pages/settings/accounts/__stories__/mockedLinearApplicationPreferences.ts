import { HttpResponse, graphql } from 'msw';
import { fn } from 'storybook/test';

import {
  CONNECTED_ACCOUNTS,
  MY_USER_WORKSPACE_ID,
  TEAMMATE_USER_WORKSPACE_ID,
  buildConnectedAccount,
  withoutDeletedAccounts,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';

export const LINEAR_APPLICATION_ID = '20202020-1a2b-4c3d-8e4f-000000000024';
export const LINEAR_CONNECTIONS_REDIRECT_LOCATION = `/settings/accounts/applications/${LINEAR_APPLICATION_ID}#connections`;
const LINEAR_CONNECTION_PROVIDER_ID = '20202020-1a2b-4c3d-8e4f-000000000071';
const LINEAR_WORKSPACE_CONNECTION_PROVIDER_ID =
  '20202020-1a2b-4c3d-8e4f-000000000073';
export const LINEAR_LEGACY_PERSONAL_ACCOUNT_ID =
  '20202020-1a2b-4c3d-8e4f-000000000086';
export const LINEAR_RECONNECT_NEEDED_ACCOUNT_ID =
  '20202020-1a2b-4c3d-8e4f-000000000081';
export const MOCKED_TRANSIENT_TOKEN = 'mocked-transient-token';

export const generateTransientToken = fn();

let isLinearClientCredentialsConfigured = true;
let hasLegacyLinearPersonalConnection = true;

export const unconfigureLinearClientCredentials = () => {
  isLinearClientCredentialsConfigured = false;
};

export const removeLegacyLinearPersonalConnection = () => {
  hasLegacyLinearPersonalConnection = false;
};

export const LINEAR_INSTALLED_APPLICATION = {
  id: LINEAR_APPLICATION_ID,
  universalIdentifier: LINEAR_APPLICATION_ID,
  name: 'Linear',
  logoUrl: null,
  createdAt: '2024-01-01T00:00:00.000Z',
};

const buildLinearConnectionProvider = () => ({
  __typename: 'ApplicationConnectionProvider',
  id: LINEAR_CONNECTION_PROVIDER_ID,
  applicationId: LINEAR_APPLICATION_ID,
  type: 'oauth',
  name: 'linear',
  displayName: 'Linear',
  scope: 'USER',
  logoUrl: null,
  oauth: {
    __typename: 'ApplicationConnectionProviderOAuthConfig',
    scopes: ['read'],
    isClientCredentialsConfigured: isLinearClientCredentialsConfigured,
  },
});

const buildLinearWorkspaceConnectionProvider = () => ({
  __typename: 'ApplicationConnectionProvider',
  id: LINEAR_WORKSPACE_CONNECTION_PROVIDER_ID,
  applicationId: LINEAR_APPLICATION_ID,
  type: 'oauth',
  name: 'linear-workspace',
  displayName: 'Linear workspace',
  scope: 'WORKSPACE',
  logoUrl: null,
  oauth: {
    __typename: 'ApplicationConnectionProviderOAuthConfig',
    scopes: ['read'],
    isClientCredentialsConfigured: isLinearClientCredentialsConfigured,
  },
});

// Mirrors the server: a workspace provider is listed only while the member holds a personal connection on it
export const buildLinearApplicationPreferences = () => ({
  __typename: 'ApplicationPreferences',
  applicationId: LINEAR_APPLICATION_ID,
  connectionProviders: [
    buildLinearConnectionProvider(),
    ...(hasLegacyLinearPersonalConnection
      ? [buildLinearWorkspaceConnectionProvider()]
      : []),
  ],
  settingsMenuItems: [],
  variables: [],
});

const LINEAR_LEGACY_PERSONAL_ACCOUNT = buildConnectedAccount({
  id: LINEAR_LEGACY_PERSONAL_ACCOUNT_ID,
  handle: 'legacy@linear.app',
  provider: 'app',
  userWorkspaceId: MY_USER_WORKSPACE_ID,
  applicationId: LINEAR_APPLICATION_ID,
  connectionProviderId: LINEAR_WORKSPACE_CONNECTION_PROVIDER_ID,
  authFailedAt: '2026-09-04T00:00:00.000Z',
});

const LINEAR_CONNECTED_ACCOUNTS = [
  buildConnectedAccount({
    id: '20202020-1a2b-4c3d-8e4f-000000000087',
    handle: 'workspace-shared@linear.app',
    provider: 'app',
    userWorkspaceId: MY_USER_WORKSPACE_ID,
    applicationId: LINEAR_APPLICATION_ID,
    connectionProviderId: LINEAR_WORKSPACE_CONNECTION_PROVIDER_ID,
    scope: 'WORKSPACE',
  }),
  buildConnectedAccount({
    id: '20202020-1a2b-4c3d-8e4f-000000000082',
    handle: 'tim@linear.app',
    name: 'Work Linear',
    provider: 'app',
    userWorkspaceId: MY_USER_WORKSPACE_ID,
    applicationId: LINEAR_APPLICATION_ID,
    connectionProviderId: LINEAR_CONNECTION_PROVIDER_ID,
  }),
  buildConnectedAccount({
    id: LINEAR_RECONNECT_NEEDED_ACCOUNT_ID,
    handle: 'tim.cook@linear.app',
    provider: 'app',
    userWorkspaceId: MY_USER_WORKSPACE_ID,
    applicationId: LINEAR_APPLICATION_ID,
    connectionProviderId: LINEAR_CONNECTION_PROVIDER_ID,
    authFailedAt: '2026-09-02T00:00:00.000Z',
  }),
  buildConnectedAccount({
    id: '20202020-1a2b-4c3d-8e4f-000000000085',
    handle: 'old@linear.app',
    provider: 'app',
    userWorkspaceId: MY_USER_WORKSPACE_ID,
    applicationId: LINEAR_APPLICATION_ID,
    connectionProviderId: LINEAR_CONNECTION_PROVIDER_ID,
    archivedAt: '2026-09-03T00:00:00.000Z',
  }),
  buildConnectedAccount({
    id: '20202020-1a2b-4c3d-8e4f-000000000083',
    handle: 'shared@linear.app',
    provider: 'app',
    userWorkspaceId: MY_USER_WORKSPACE_ID,
    applicationId: LINEAR_APPLICATION_ID,
    connectionProviderId: LINEAR_CONNECTION_PROVIDER_ID,
    scope: 'WORKSPACE',
  }),
  buildConnectedAccount({
    id: '20202020-1a2b-4c3d-8e4f-000000000084',
    handle: 'teammate@linear.app',
    provider: 'app',
    userWorkspaceId: TEAMMATE_USER_WORKSPACE_ID,
    applicationId: LINEAR_APPLICATION_ID,
    connectionProviderId: LINEAR_CONNECTION_PROVIDER_ID,
  }),
];

export const LINEAR_CONNECTED_ACCOUNTS_GRAPHQL_HANDLER = graphql.query(
  'MyConnectedAccounts',
  () =>
    HttpResponse.json({
      data: {
        myConnectedAccounts: withoutDeletedAccounts([
          ...CONNECTED_ACCOUNTS,
          ...LINEAR_CONNECTED_ACCOUNTS,
          ...(hasLegacyLinearPersonalConnection
            ? [LINEAR_LEGACY_PERSONAL_ACCOUNT]
            : []),
        ]),
      },
    }),
);

export const GENERATE_TRANSIENT_TOKEN_GRAPHQL_HANDLER = graphql.mutation(
  'generateTransientToken',
  () => {
    generateTransientToken();

    return HttpResponse.json({
      data: {
        generateTransientToken: {
          __typename: 'TransientTokenDTO',
          transientToken: {
            __typename: 'AuthToken',
            token: MOCKED_TRANSIENT_TOKEN,
          },
        },
      },
    });
  },
);

export const resetLinearApplicationPreferencesMocks = () => {
  isLinearClientCredentialsConfigured = true;
  hasLegacyLinearPersonalConnection = true;
  generateTransientToken.mockClear();
};
