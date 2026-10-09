import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

import { SettingsApplicationDetails } from '~/pages/settings/applications/SettingsApplicationDetails';

const APPLICATION_ID = '20202020-6a7b-4c3d-8e4f-000000000001';
const WORKSPACE_SETTINGS_MENU_ITEM_ID = '20202020-6a7b-4c3d-8e4f-000000000011';
const USER_SETTINGS_MENU_ITEM_ID = '20202020-6a7b-4c3d-8e4f-000000000012';

const buildApplicationVariable = ({
  key,
  label,
  value,
  scope,
}: {
  key: string;
  label: string;
  value: string;
  scope: 'USER' | 'WORKSPACE';
}) => ({
  __typename: 'ApplicationVariable',
  id: `${key}-id`,
  key,
  value,
  description: '',
  label,
  isSecret: false,
  isDeprecated: false,
  isRequired: false,
  type: 'TEXT',
  options: null,
  scope,
});

const buildSettingsMenuItem = ({
  id,
  title,
  scope,
}: {
  id: string;
  title: string;
  scope: 'USER' | 'WORKSPACE';
}) => ({
  __typename: 'SettingsMenuItem',
  id,
  universalIdentifier: id,
  applicationId: APPLICATION_ID,
  frontComponentId: `${id}-front-component`,
  title,
  icon: null,
  position: 0,
  scope,
});

const savedValueByKey = new Map<string, string>();

const updateOneApplicationVariable = fn();

const buildWorkspaceVariable = () =>
  buildApplicationVariable({
    key: 'WORKSPACE_URL',
    label: 'Workspace URL',
    value:
      savedValueByKey.get('WORKSPACE_URL') ?? 'https://recorder.example.com',
    scope: 'WORKSPACE',
  });

const USER_VARIABLE = buildApplicationVariable({
  key: 'RECORD_MY_MEETINGS',
  label: 'Record my meetings',
  value: 'always',
  scope: 'USER',
});

const WORKSPACE_SETTINGS_MENU_ITEM = buildSettingsMenuItem({
  id: WORKSPACE_SETTINGS_MENU_ITEM_ID,
  title: 'Recording rules',
  scope: 'WORKSPACE',
});

const USER_SETTINGS_MENU_ITEM = buildSettingsMenuItem({
  id: USER_SETTINGS_MENU_ITEM_ID,
  title: 'My recordings',
  scope: 'USER',
});

const buildApplicationHandlers = ({
  settingsMenuItems,
}: {
  settingsMenuItems: ReturnType<typeof buildSettingsMenuItem>[];
}) => [
  graphql.query('FindOneApplication', () =>
    HttpResponse.json({
      data: {
        findOneApplication: {
          __typename: 'Application',
          id: APPLICATION_ID,
          name: 'Recorder',
          description: 'Records meetings',
          logoUrl: null,
          version: '1.0.0',
          universalIdentifier: APPLICATION_ID,
          applicationRegistrationId: null,
          applicationRegistration: null,
          canBeUninstalled: true,
          isUninstallBlockedByOtherWorkspaceInstallations: false,
          autoUpgrade: false,
          defaultRoleId: null,
          settingsCustomTabFrontComponentId: null,
          healthCheckLogicFunctionId: null,
          availablePackages: {},
          applicationVariables: [USER_VARIABLE, buildWorkspaceVariable()],
          agents: [],
          frontComponents: [],
          commandMenuItems: [],
          settingsMenuItems,
          objects: [],
          logicFunctions: [],
        },
      },
    }),
  ),
  graphql.query('FindMarketplaceAppDetail', () =>
    HttpResponse.json({
      errors: [{ message: 'Not listed', extensions: { code: 'NOT_FOUND' } }],
    }),
  ),
  graphql.query('IsApplicationStopped', () =>
    HttpResponse.json({ data: { isApplicationStopped: false } }),
  ),
  graphql.mutation('UpdateOneApplicationVariable', ({ variables }) => {
    updateOneApplicationVariable(variables);
    savedValueByKey.set(variables.key, variables.value);

    return HttpResponse.json({
      data: { updateOneApplicationVariable: true },
    });
  }),
  ...graphqlMocks.handlers,
];

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Applications/SettingsApplicationDetails',
  component: SettingsApplicationDetails,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/applications/:applicationId',
    routeParams: { ':applicationId': APPLICATION_ID },
  },
  beforeEach: async () => {
    savedValueByKey.clear();
    updateOneApplicationVariable.mockClear();
    await mockedApolloClient.clearStore();
  },
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: buildApplicationHandlers({
        settingsMenuItems: [USER_SETTINGS_MENU_ITEM],
      }),
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsApplicationDetails>;

export const VariablesTabIgnoresUserScope: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('link', { name: 'Variables' }, { timeout: 3000 }),
    );

    expect(await canvas.findByText('Workspace URL')).toBeVisible();
    expect(
      canvas.getByDisplayValue('https://recorder.example.com'),
    ).toBeVisible();
    expect(canvas.queryByText('Record my meetings')).not.toBeInTheDocument();
    expect(canvas.queryByText('My recordings')).not.toBeInTheDocument();
  },
};

export const SettingsTabsIgnoreUserScope: Story = {
  parameters: {
    msw: {
      handlers: buildApplicationHandlers({
        settingsMenuItems: [
          USER_SETTINGS_MENU_ITEM,
          WORKSPACE_SETTINGS_MENU_ITEM,
        ],
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole(
        'link',
        { name: 'Recording rules' },
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(canvas.queryByText('My recordings')).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('link', { name: 'Variables' }),
    ).not.toBeInTheDocument();
  },
};

export const VariablesTabSavesWorkspaceVariable: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('link', { name: 'Variables' }, { timeout: 3000 }),
    );

    const saveButton = await canvas.findByRole('button', {
      name: 'Save settings',
    });
    const workspaceUrlInput = await canvas.findByDisplayValue(
      'https://recorder.example.com',
    );

    expect(saveButton).toBeDisabled();

    await userEvent.clear(workspaceUrlInput);
    await userEvent.type(workspaceUrlInput, 'https://new.example.com');

    await waitFor(() => expect(saveButton).toBeEnabled());
    await userEvent.click(saveButton);

    await waitFor(() =>
      expect(updateOneApplicationVariable.mock.calls).toEqual([
        [
          {
            applicationId: APPLICATION_ID,
            key: 'WORKSPACE_URL',
            value: 'https://new.example.com',
          },
        ],
      ]),
    );
    await waitFor(() => expect(saveButton).toBeDisabled());
    expect(canvas.getByDisplayValue('https://new.example.com')).toBeVisible();
  },
};
