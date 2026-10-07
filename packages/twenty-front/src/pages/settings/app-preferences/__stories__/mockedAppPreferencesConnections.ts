import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type AppPreferencesApplication } from '@/settings/app-preferences/types/AppPreferencesApplication';
import { type AppPreferencesConnectedAccount } from '@/settings/app-preferences/types/AppPreferencesConnectedAccount';
import { type AppPreferencesConnectionProvider } from '@/settings/app-preferences/types/AppPreferencesConnectionProvider';
import { type AppPreferenceVariable } from '@/settings/app-preferences/types/AppPreferenceVariable';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { delay, graphql, HttpResponse } from 'msw';
import { fn } from 'storybook/test';
import {
  ConnectedAccountProvider,
  FieldMetadataType,
} from 'twenty-shared/types';
import {
  type ApplicationConnectionProvidersQuery,
  type ApplicationConnectionProvidersQueryVariables,
  type DisconnectConnectedAccountMutation,
  type DisconnectConnectedAccountMutationVariables,
  type GenerateTransientTokenMutation,
  type GenerateTransientTokenMutationVariables,
  type MyAppPreferencesApplicationVariablesQuery,
  type MyAppPreferencesApplicationVariablesQueryVariables,
  type MyAppPreferencesApplicationsQuery,
  type MyAppPreferencesApplicationsQueryVariables,
  type MyAppPreferencesConnectedAccountsQuery,
  type MyAppPreferencesConnectedAccountsQueryVariables,
  type MyConnectedAccountsQuery,
  type UpdateMyUserApplicationVariableMutation,
  type UpdateMyUserApplicationVariableMutationVariables,
} from '~/generated-metadata/graphql';
import { getAppPreferencesMocks } from '~/pages/settings/app-preferences/__stories__/mockedAppPreferencesData';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

type UsableAccount = AppPreferencesConnectedAccount &
  MyConnectedAccountsQuery['myConnectedAccounts'][number];

export const OWN_USER_WORKSPACE_ID = '20202020-0000-4000-8000-00000000b001';

export const FATHOM_APPLICATION: AppPreferencesApplication = {
  id: '20202020-0000-4000-8000-00000000b002',
  universalIdentifier: '20202020-0000-4000-8000-00000000b003',
  name: 'Fathom',
  logoUrl: null,
  hasConnectionProviders: true,
};

export const FATHOM_PROVIDER: AppPreferencesConnectionProvider = {
  id: '20202020-0000-4000-8000-00000000b004',
  applicationId: FATHOM_APPLICATION.id,
  type: 'oauth',
  name: 'fathom',
  displayName: 'Fathom',
  logoUrl: null,
  oauth: { scopes: ['public_api'], isClientCredentialsConfigured: true },
};

export const PERSONAL_FATHOM_ACCOUNT: AppPreferencesConnectedAccount = {
  id: '20202020-0000-4000-8000-00000000b005',
  handle: 'same@example.com',
  name: 'My Fathom account',
  provider: ConnectedAccountProvider.APP,
  applicationId: FATHOM_APPLICATION.id,
  connectionProviderId: FATHOM_PROVIDER.id,
  userWorkspaceId: OWN_USER_WORKSPACE_ID,
  visibility: 'user',
  scopes: ['public_api'],
  archivedAt: null,
  authFailedAt: null,
};

export const SHARED_FATHOM_ACCOUNT: AppPreferencesConnectedAccount = {
  ...PERSONAL_FATHOM_ACCOUNT,
  id: '20202020-0000-4000-8000-00000000b006',
  name: 'Shared Fathom account',
  userWorkspaceId: '20202020-0000-4000-8000-00000000b007',
  visibility: 'workspace',
};

export const FATHOM_USER_PREFERENCE: AppPreferenceVariable = {
  key: 'MEETING_PREFIX',
  label: 'Meeting prefix',
  description: 'Name new meetings',
  value: 'Meeting',
  type: FieldMetadataType.TEXT,
  options: null,
  isSecret: false,
  isRequired: false,
  isDeprecated: false,
};

export const disconnectAccount = fn();
export const createTransientToken = fn();
export const readConnectedAccounts = fn();
export const readConnectionProviders = fn();
export const saveUserPreference = fn();

export const prepareConnectionOwner = () => {
  const previousWorkspaceMember = jotaiStore.get(
    currentWorkspaceMemberState.atom,
  );
  jotaiStore.set(currentWorkspaceMemberState.atom, {
    ...mockedWorkspaceMemberData,
    userWorkspaceId: OWN_USER_WORKSPACE_ID,
  });
  return () =>
    jotaiStore.set(currentWorkspaceMemberState.atom, previousWorkspaceMember);
};

export const getAppPreferencesConnectionMocks = ({
  accounts = [],
  connectionProviders = [FATHOM_PROVIDER],
  application = FATHOM_APPLICATION,
  applicationVariables = [],
  failFirstAccountRead = false,
  failFirstProviderRead = false,
  failFirstDisconnect = false,
  failFirstConnect = false,
  accountReadDelay = 0,
  canManageConnectedAccounts = true,
  builtInAccounts = [],
  isAppPreferencesEnabled = true,
}: {
  accounts?: AppPreferencesConnectedAccount[];
  connectionProviders?: AppPreferencesConnectionProvider[];
  application?: AppPreferencesApplication;
  applicationVariables?: AppPreferenceVariable[];
  failFirstAccountRead?: boolean;
  failFirstProviderRead?: boolean;
  failFirstDisconnect?: boolean;
  failFirstConnect?: boolean;
  accountReadDelay?: number;
  canManageConnectedAccounts?: boolean;
  builtInAccounts?: ConnectedAccount[];
  isAppPreferencesEnabled?: boolean;
} = {}) => {
  let currentAccounts = accounts;
  const savedPreferences = new Map<string, string>();
  const reset = () => {
    currentAccounts = accounts;
    savedPreferences.clear();
  };
  const getUsableAccounts = (): UsableAccount[] => [
    ...builtInAccounts.map(
      (account): UsableAccount => ({
        ...account,
        applicationId: null,
        authFailedReason: null,
        __typename: 'ConnectedAccountPublicDTO',
      }),
    ),
    ...currentAccounts.map(
      (account): UsableAccount => ({
        ...account,
        __typename: 'ConnectedAccountPublicDTO',
        authFailedReason: null,
        handleAliases: null,
        lastSignedInAt: null,
        lastCredentialsRefreshedAt: null,
        connectionParameters: null,
        createdAt: '2026-10-08T00:00:00.000Z',
        updatedAt: '2026-10-08T00:00:00.000Z',
      }),
    ),
  ];
  return {
    reset,
    handlers: [
      graphql.query<
        MyAppPreferencesApplicationsQuery,
        MyAppPreferencesApplicationsQueryVariables
      >('MyAppPreferencesApplications', () =>
        HttpResponse.json({
          data: { myAppPreferencesApplications: [application] },
        }),
      ),
      graphql.query<
        MyAppPreferencesConnectedAccountsQuery,
        MyAppPreferencesConnectedAccountsQueryVariables
      >('MyAppPreferencesConnectedAccounts', async () => {
        readConnectedAccounts();
        if (accountReadDelay > 0) {
          await delay(accountReadDelay);
        }
        return failFirstAccountRead &&
          readConnectedAccounts.mock.calls.length === 1
          ? HttpResponse.json({ errors: [{ message: 'Account read failed' }] })
          : HttpResponse.json({
              data: { myConnectedAccounts: getUsableAccounts() },
            });
      }),
      graphql.query('MyConnectedAccounts', () =>
        HttpResponse.json({
          data: { myConnectedAccounts: getUsableAccounts() },
        }),
      ),
      graphql.query<
        ApplicationConnectionProvidersQuery,
        ApplicationConnectionProvidersQueryVariables
      >('ApplicationConnectionProviders', ({ variables }) => {
        readConnectionProviders(variables);
        return failFirstProviderRead &&
          readConnectionProviders.mock.calls.length === 1
          ? HttpResponse.json({ errors: [{ message: 'Provider read failed' }] })
          : HttpResponse.json({
              data: { applicationConnectionProviders: connectionProviders },
            });
      }),
      graphql.query<
        MyAppPreferencesApplicationVariablesQuery,
        MyAppPreferencesApplicationVariablesQueryVariables
      >('MyAppPreferencesApplicationVariables', () =>
        HttpResponse.json({
          data: {
            myAppPreferencesApplicationVariables: applicationVariables.map(
              (variable) => ({
                ...variable,
                value: savedPreferences.get(variable.key) ?? variable.value,
              }),
            ),
          },
        }),
      ),
      graphql.mutation<
        GenerateTransientTokenMutation,
        GenerateTransientTokenMutationVariables
      >('generateTransientToken', () => {
        createTransientToken();
        return failFirstConnect && createTransientToken.mock.calls.length === 1
          ? HttpResponse.json({
              errors: [{ message: 'Unable to create transient token' }],
            })
          : HttpResponse.json({
              data: {
                generateTransientToken: {
                  transientToken: {
                    token: 'personal-app-oauth-transient-token',
                  },
                },
              },
            });
      }),
      graphql.mutation<
        DisconnectConnectedAccountMutation,
        DisconnectConnectedAccountMutationVariables
      >('DisconnectConnectedAccount', ({ variables }) => {
        disconnectAccount(variables);
        if (failFirstDisconnect && disconnectAccount.mock.calls.length === 1) {
          return HttpResponse.json({
            errors: [{ message: 'Lifecycle disconnect failed' }],
          });
        }
        currentAccounts = currentAccounts.map((account) =>
          account.id === variables.id
            ? { ...account, archivedAt: '2026-10-08T00:00:00.000Z' }
            : account,
        );
        return HttpResponse.json({
          data: { disconnectConnectedAccount: { id: variables.id } },
        });
      }),
      graphql.mutation<
        UpdateMyUserApplicationVariableMutation,
        UpdateMyUserApplicationVariableMutationVariables
      >('UpdateMyUserApplicationVariable', ({ variables }) => {
        saveUserPreference(variables);
        savedPreferences.set(variables.key, variables.value);
        return HttpResponse.json({
          data: { updateMyUserApplicationVariable: true },
        });
      }),
      ...getAppPreferencesMocks({
        accounts: builtInAccounts,
        canManageConnectedAccounts,
        isAppPreferencesEnabled,
      }).handlers,
    ],
  };
};
