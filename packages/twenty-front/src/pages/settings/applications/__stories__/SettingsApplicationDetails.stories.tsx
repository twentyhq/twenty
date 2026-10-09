import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, userEvent, within } from 'storybook/test';

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

const WORKSPACE_VARIABLE = buildApplicationVariable({
  key: 'WORKSPACE_URL',
  label: 'Workspace URL',
  value: 'https://recorder.example.com',
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
          applicationVariables: [USER_VARIABLE, WORKSPACE_VARIABLE],
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
      await canvas.findByTestId('tab-variables', undefined, { timeout: 3000 }),
    );

    expect(await canvas.findByText('Workspace URL')).toBeVisible();
    expect(
      canvas.getByDisplayValue('https://recorder.example.com'),
    ).toBeVisible();
    expect(canvas.queryByText('Record my meetings')).not.toBeInTheDocument();
    expect(
      canvas.queryByTestId(`tab-${USER_SETTINGS_MENU_ITEM_ID}`),
    ).not.toBeInTheDocument();
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
      await canvas.findByTestId(
        `tab-${WORKSPACE_SETTINGS_MENU_ITEM_ID}`,
        undefined,
        { timeout: 3000 },
      ),
    ).toHaveTextContent('Recording rules');
    expect(
      canvas.queryByTestId(`tab-${USER_SETTINGS_MENU_ITEM_ID}`),
    ).not.toBeInTheDocument();
    expect(canvas.queryByText('My recordings')).not.toBeInTheDocument();
    expect(canvas.queryByTestId('tab-variables')).not.toBeInTheDocument();
  },
};
