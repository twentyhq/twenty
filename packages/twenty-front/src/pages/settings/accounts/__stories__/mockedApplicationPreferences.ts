import { isNonEmptyString } from '@sniptt/guards';
import { HttpResponse, graphql } from 'msw';
import { getWorker } from 'msw-storybook-addon';
import { fn } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
  CONNECTED_ACCOUNTS,
  FATHOM_APPLICATION_ID,
  GRANOLA_APPLICATION_ID,
  MY_USER_WORKSPACE_ID,
  TEAMMATE_USER_WORKSPACE_ID,
  buildConnectedAccount,
  myApplicationPreferencesRequested,
  seedAccountGroupsStory,
  withoutDeletedAccounts,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';

export const GRANOLA_USER_SETTINGS_FRONT_COMPONENT_ID =
  '20202020-1a2b-4c3d-8e4f-000000000051';
const NOT_INSTALLED_APPLICATION_ID = '20202020-1a2b-4c3d-8e4f-000000000023';
const GRANOLA_USER_SETTINGS_MENU_ITEM_ID =
  '20202020-1a2b-4c3d-8e4f-000000000062';
export const LINEAR_APPLICATION_ID = '20202020-1a2b-4c3d-8e4f-000000000024';
export const LINEAR_CONNECTIONS_REDIRECT_LOCATION = `/settings/accounts/applications/${LINEAR_APPLICATION_ID}#connections`;
const LINEAR_CONNECTION_PROVIDER_ID = '20202020-1a2b-4c3d-8e4f-000000000071';
export const LINEAR_RECONNECT_NEEDED_ACCOUNT_ID =
  '20202020-1a2b-4c3d-8e4f-000000000081';

const buildUserApplicationVariable = ({
  key,
  label,
  value = '',
  isSecret = false,
  isDeprecated = false,
  isRequired = false,
}: {
  key: string;
  label: string;
  value?: string;
  isSecret?: boolean;
  isDeprecated?: boolean;
  isRequired?: boolean;
}) => ({
  __typename: 'UserApplicationVariableValue',
  key,
  label,
  value,
  description: '',
  isSecret,
  isDeprecated,
  isRequired,
  type: 'TEXT',
  options: null,
});

const buildSettingsMenuItem = ({
  universalIdentifier,
  applicationId,
  frontComponentId,
  title,
  position,
  scope,
}: {
  universalIdentifier: string;
  applicationId: string;
  frontComponentId: string;
  title: string;
  position: number;
  scope: 'USER' | 'WORKSPACE';
}) => ({
  __typename: 'SettingsMenuItem',
  id: `${universalIdentifier}-id`,
  universalIdentifier,
  applicationId,
  frontComponentId,
  title,
  icon: null,
  position,
  scope,
});

const savedValueByKey = new Map<string, string>();
let isLinearClientCredentialsConfigured = true;

const FATHOM_CONNECTION_PROVIDER = {
  __typename: 'ApplicationConnectionProvider',
  id: '20202020-1a2b-4c3d-8e4f-000000000072',
  applicationId: FATHOM_APPLICATION_ID,
  type: 'oauth',
  name: 'fathom',
  displayName: 'Fathom',
  scope: 'USER',
  logoUrl: null,
  oauth: {
    __typename: 'ApplicationConnectionProviderOAuthConfig',
    scopes: ['read'],
    isClientCredentialsConfigured: true,
  },
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

const LINEAR_CONNECTED_ACCOUNTS = [
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

const SAVED_PERSONAL_API_KEY = 'sk-1abcdefghijklmnopqrstuvwxyz0123456789';

// Same masking as the server's SecretEncryptionService.maskDecryptedValue.
const maskStoredSecret = (storedValue: string | undefined) => {
  if (!isDefined(storedValue)) {
    return '';
  }

  const visibleCharacterCount = Math.min(
    5,
    Math.floor(storedValue.length / 10),
  );

  return `${storedValue.slice(0, visibleCharacterCount)}********`;
};

export const updateMyUserApplicationVariable = fn();
export const generateTransientToken = fn();
export const MOCKED_TRANSIENT_TOKEN = 'mocked-transient-token';
export const findOneFrontComponent = fn();
export const findApplicationsGatedQuery = fn();

const buildApplicationPreferences = () => [
  {
    __typename: 'ApplicationPreferences',
    applicationId: FATHOM_APPLICATION_ID,
    connectionProviders: [FATHOM_CONNECTION_PROVIDER],
    settingsMenuItems: [],
    variables: [
      buildUserApplicationVariable({
        key: 'RECORD_MY_MEETINGS',
        label: 'Record my meetings',
        value: savedValueByKey.get('RECORD_MY_MEETINGS') ?? 'always',
      }),
      buildUserApplicationVariable({
        key: 'PERSONAL_API_KEY',
        label: 'Personal API key',
        value: maskStoredSecret(savedValueByKey.get('PERSONAL_API_KEY')),
        isSecret: true,
      }),
      buildUserApplicationVariable({
        key: 'OLD_FLAG',
        label: 'Old flag',
        isDeprecated: true,
      }),
      buildUserApplicationVariable({
        key: 'MEETING_LANGUAGE',
        label: 'Meeting language',
        value: savedValueByKey.get('MEETING_LANGUAGE'),
        isRequired: true,
      }),
    ],
  },
  {
    __typename: 'ApplicationPreferences',
    applicationId: GRANOLA_APPLICATION_ID,
    connectionProviders: [],
    settingsMenuItems: [
      buildSettingsMenuItem({
        universalIdentifier: GRANOLA_USER_SETTINGS_MENU_ITEM_ID,
        applicationId: GRANOLA_APPLICATION_ID,
        frontComponentId: GRANOLA_USER_SETTINGS_FRONT_COMPONENT_ID,
        title: 'My notes',
        position: 1,
        scope: 'USER',
      }),
    ],
    variables: [
      buildUserApplicationVariable({
        key: 'LANGUAGE',
        label: 'Language',
        value: 'en',
      }),
    ],
  },
  {
    __typename: 'ApplicationPreferences',
    applicationId: NOT_INSTALLED_APPLICATION_ID,
    connectionProviders: [],
    settingsMenuItems: [],
    variables: [
      buildUserApplicationVariable({
        key: 'LANGUAGE',
        label: 'Language',
        value: 'en',
      }),
    ],
  },
  {
    __typename: 'ApplicationPreferences',
    applicationId: LINEAR_APPLICATION_ID,
    connectionProviders: [buildLinearConnectionProvider()],
    settingsMenuItems: [],
    variables: [],
  },
];

export const unconfigureLinearClientCredentials = () => {
  isLinearClientCredentialsConfigured = false;
};

export const failNextApplicationPreferencesRequest = () => {
  getWorker().use(
    graphql.query(
      'MyApplicationPreferences',
      () =>
        HttpResponse.json({
          errors: [
            {
              message: 'Internal server error',
              extensions: { code: 'INTERNAL_SERVER_ERROR' },
            },
          ],
        }),
      { once: true },
    ),
  );
};

export const APPLICATION_PREFERENCES_GRAPHQL_HANDLERS = [
  graphql.query('MyApplicationPreferences', () => {
    myApplicationPreferencesRequested();

    return HttpResponse.json({
      data: { myApplicationPreferences: buildApplicationPreferences() },
    });
  }),
  graphql.mutation('UpdateMyUserApplicationVariable', ({ variables }) => {
    updateMyUserApplicationVariable(variables);

    if (!isNonEmptyString(variables.value)) {
      savedValueByKey.delete(variables.key);
    } else {
      savedValueByKey.set(variables.key, variables.value);
    }

    return HttpResponse.json({
      data: { updateMyUserApplicationVariable: true },
    });
  }),
  graphql.mutation('generateTransientToken', () => {
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
  }),
  graphql.query('FindOneFrontComponent', ({ variables }) => {
    findOneFrontComponent(variables.id);

    return HttpResponse.json({ data: { frontComponent: null } });
  }),
  ...['FindOneApplication', 'FindManyApplications'].map((operationName) =>
    graphql.query(operationName, () => {
      findApplicationsGatedQuery(operationName);

      return HttpResponse.json({
        errors: [{ message: 'Forbidden', extensions: { code: 'FORBIDDEN' } }],
      });
    }),
  ),
  ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
];

export const APPLICATION_PREFERENCES_DETAIL_GRAPHQL_HANDLERS = [
  graphql.query('MyConnectedAccounts', () =>
    HttpResponse.json({
      data: {
        myConnectedAccounts: withoutDeletedAccounts([
          ...CONNECTED_ACCOUNTS,
          ...LINEAR_CONNECTED_ACCOUNTS,
        ]),
      },
    }),
  ),
  ...APPLICATION_PREFERENCES_GRAPHQL_HANDLERS,
];

export const seedApplicationPreferencesStory = async () => {
  savedValueByKey.clear();
  savedValueByKey.set('PERSONAL_API_KEY', SAVED_PERSONAL_API_KEY);
  isLinearClientCredentialsConfigured = true;
  updateMyUserApplicationVariable.mockClear();
  generateTransientToken.mockClear();
  findOneFrontComponent.mockClear();
  findApplicationsGatedQuery.mockClear();

  await seedAccountGroupsStory();

  const currentWorkspace = jotaiStore.get(currentWorkspaceState.atom);

  if (isDefined(currentWorkspace)) {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...currentWorkspace,
      installedApplications: [
        ...currentWorkspace.installedApplications,
        {
          id: LINEAR_APPLICATION_ID,
          universalIdentifier: LINEAR_APPLICATION_ID,
          name: 'Linear',
          logoUrl: null,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    });
  }
};
