import { HttpResponse, graphql } from 'msw';
import { fn } from 'storybook/test';

import {
  ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
  FATHOM_APPLICATION_ID,
  GRANOLA_APPLICATION_ID,
  seedAccountGroupsStory,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';

export const GRANOLA_USER_SETTINGS_FRONT_COMPONENT_ID =
  '20202020-1a2b-4c3d-8e4f-000000000051';
const GRANOLA_WORKSPACE_SETTINGS_FRONT_COMPONENT_ID =
  '20202020-1a2b-4c3d-8e4f-000000000052';
const NOT_INSTALLED_APPLICATION_ID = '20202020-1a2b-4c3d-8e4f-000000000023';
const GRANOLA_USER_SETTINGS_MENU_ITEM_ID =
  '20202020-1a2b-4c3d-8e4f-000000000062';
const GRANOLA_WORKSPACE_SETTINGS_MENU_ITEM_ID =
  '20202020-1a2b-4c3d-8e4f-000000000061';

const buildUserApplicationVariable = ({
  key,
  label,
  value = '',
  isSecret = false,
  isDeprecated = false,
}: {
  key: string;
  label: string;
  value?: string;
  isSecret?: boolean;
  isDeprecated?: boolean;
}) => ({
  __typename: 'UserApplicationVariableValue',
  key,
  label,
  value,
  description: '',
  isSecret,
  isDeprecated,
  isRequired: false,
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

export const updateMyUserApplicationVariable = fn();
export const findOneFrontComponent = fn();
export const findApplicationsGatedQuery = fn();

const buildApplicationPreferences = () => [
  {
    __typename: 'ApplicationPreferences',
    applicationId: FATHOM_APPLICATION_ID,
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
        value: '********',
        isSecret: true,
      }),
      buildUserApplicationVariable({
        key: 'OLD_FLAG',
        label: 'Old flag',
        isDeprecated: true,
      }),
    ],
  },
  {
    __typename: 'ApplicationPreferences',
    applicationId: GRANOLA_APPLICATION_ID,
    settingsMenuItems: [
      buildSettingsMenuItem({
        universalIdentifier: GRANOLA_WORKSPACE_SETTINGS_MENU_ITEM_ID,
        applicationId: GRANOLA_APPLICATION_ID,
        frontComponentId: GRANOLA_WORKSPACE_SETTINGS_FRONT_COMPONENT_ID,
        title: 'Team notes',
        position: 0,
        scope: 'WORKSPACE',
      }),
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
    settingsMenuItems: [],
    variables: [
      buildUserApplicationVariable({
        key: 'LANGUAGE',
        label: 'Language',
        value: 'en',
      }),
    ],
  },
];

export const APPLICATION_PREFERENCES_GRAPHQL_HANDLERS = [
  graphql.query('MyApplicationPreferences', () =>
    HttpResponse.json({
      data: { myApplicationPreferences: buildApplicationPreferences() },
    }),
  ),
  graphql.mutation('UpdateMyUserApplicationVariable', ({ variables }) => {
    updateMyUserApplicationVariable(variables);
    savedValueByKey.set(variables.key, variables.value);

    return HttpResponse.json({
      data: { updateMyUserApplicationVariable: true },
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

export const seedApplicationPreferencesStory = async () => {
  savedValueByKey.clear();
  updateMyUserApplicationVariable.mockClear();
  findOneFrontComponent.mockClear();
  findApplicationsGatedQuery.mockClear();

  await seedAccountGroupsStory();
};
