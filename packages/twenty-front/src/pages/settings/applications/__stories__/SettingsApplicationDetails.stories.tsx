import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { getWorker } from 'msw-storybook-addon';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { isDefined } from 'twenty-shared/utils';
import {
  ApplicationRegistrationSourceType,
  FeatureFlagKey,
  type FindMarketplaceAppDetailQuery,
} from '~/generated-metadata/graphql';

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

const runApplicationHealthCheck = fn();

const HEALTH_CHECK_LOGIC_FUNCTION_ID = '20202020-6a7b-4c3d-8e4f-000000000021';

const MARKETPLACE_APP_DETAIL: FindMarketplaceAppDetailQuery['findMarketplaceAppDetail'] =
  {
    __typename: 'MarketplaceAppDetail',
    id: 'recorder-marketplace-id',
    universalIdentifier: APPLICATION_ID,
    name: 'Recorder Pro',
    sourceType: ApplicationRegistrationSourceType.NPM,
    sourcePackage: '@twenty/recorder',
    latestAvailableVersion: '1.0.0',
    isListed: true,
    description: 'Records and transcribes every meeting.',
    author: 'Twenty',
    category: 'Productivity',
    logoUrl: null,
    websiteUrl: null,
    aboutDescription: null,
    pricingDescription: null,
    termsUrl: null,
    emailSupport: null,
    issueReportUrl: null,
    galleryImages: ['https://example.com/recorder-cover.png'],
    installCount: 12,
    defaultRoleUniversalIdentifier: null,
    requestedCapabilities: [],
    billsCredits: false,
    objects: [],
    roles: [],
  };

const buildApplicationHandlers = ({
  settingsMenuItems,
  healthCheckLogicFunctionId = null,
  runOnUserPreferences = false,
  marketplaceAppDetail,
}: {
  settingsMenuItems: ReturnType<typeof buildSettingsMenuItem>[];
  healthCheckLogicFunctionId?: string | null;
  runOnUserPreferences?: boolean;
  marketplaceAppDetail?: FindMarketplaceAppDetailQuery['findMarketplaceAppDetail'];
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
          healthCheckLogicFunctionId,
          runOnUserPreferences,
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
    HttpResponse.json(
      isDefined(marketplaceAppDetail)
        ? { data: { findMarketplaceAppDetail: marketplaceAppDetail } }
        : {
            errors: [
              { message: 'Not listed', extensions: { code: 'NOT_FOUND' } },
            ],
          },
    ),
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
  graphql.mutation('RunApplicationHealthCheck', ({ variables }) => {
    runApplicationHealthCheck(variables);

    return HttpResponse.json({
      data: {
        runApplicationHealthCheck: {
          __typename: 'ApplicationHealthCheckResult',
          status: 'WARNING',
          title: 'Your recorder plan is almost used up',
          description: null,
          action: null,
        },
      },
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
    runApplicationHealthCheck.mockClear();
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

export const MarketplaceListingFillsTheHeaderAndOverview: Story = {
  parameters: {
    msw: {
      handlers: buildApplicationHandlers({
        settingsMenuItems: [USER_SETTINGS_MENU_ITEM],
        marketplaceAppDetail: MARKETPLACE_APP_DETAIL,
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Records and transcribes every meeting.',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
    const breadcrumb = within(canvas.getByLabelText('Breadcrumb'));

    expect(breadcrumb.getByRole('link', { name: 'Apps' })).toBeVisible();
    expect(breadcrumb.getByText('Recorder Pro')).toBeVisible();
    expect(
      canvasElement.querySelector(
        'img[src="https://example.com/recorder-cover.png"]',
      ),
    ).not.toBeNull();
    expect(
      canvas.getByRole('button', { name: 'View in marketplace' }),
    ).toBeVisible();
  },
};

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

export const WorkspaceHealthCheckRunsOnOpenAndAfterSave: Story = {
  parameters: {
    msw: {
      handlers: buildApplicationHandlers({
        settingsMenuItems: [USER_SETTINGS_MENU_ITEM],
        healthCheckLogicFunctionId: HEALTH_CHECK_LOGIC_FUNCTION_ID,
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Your recorder plan is almost used up',
        undefined,
        {
          timeout: 3000,
        },
      ),
    ).toBeVisible();
    expect(runApplicationHealthCheck.mock.calls).toEqual([
      [{ applicationId: APPLICATION_ID }],
    ]);

    await userEvent.click(canvas.getByRole('link', { name: 'Variables' }));

    const saveButton = await canvas.findByRole('button', {
      name: 'Save settings',
    });
    const workspaceUrlInput = await canvas.findByDisplayValue(
      'https://recorder.example.com',
    );

    await userEvent.clear(workspaceUrlInput);
    await userEvent.type(workspaceUrlInput, 'https://new.example.com');
    await waitFor(() => expect(saveButton).toBeEnabled());
    await userEvent.click(saveButton);

    await waitFor(() =>
      expect(runApplicationHealthCheck).toHaveBeenCalledTimes(2),
    );
    await waitFor(() => expect(saveButton).toBeDisabled());

    await userEvent.click(canvas.getByRole('link', { name: 'General' }));

    expect(
      await canvas.findByText('Your recorder plan is almost used up'),
    ).toBeVisible();
    expect(runApplicationHealthCheck.mock.calls).toEqual([
      [{ applicationId: APPLICATION_ID }],
      [{ applicationId: APPLICATION_ID }],
    ]);
  },
};

export const MemberHealthCheckDoesNotRunOnWorkspacePage: Story = {
  parameters: {
    msw: {
      handlers: buildApplicationHandlers({
        settingsMenuItems: [USER_SETTINGS_MENU_ITEM],
        healthCheckLogicFunctionId: HEALTH_CHECK_LOGIC_FUNCTION_ID,
        runOnUserPreferences: true,
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('link', { name: 'Variables' }, { timeout: 3000 }),
    );
    expect(runApplicationHealthCheck).not.toHaveBeenCalled();

    const saveButton = canvas.getByRole('button', { name: 'Save settings' });
    const workspaceUrlInput = await canvas.findByDisplayValue(
      'https://recorder.example.com',
    );

    await userEvent.clear(workspaceUrlInput);
    await userEvent.type(workspaceUrlInput, 'https://new.example.com');
    await waitFor(() => expect(saveButton).toBeEnabled());
    await userEvent.click(saveButton);

    await waitFor(() => expect(saveButton).toBeDisabled());
    expect(updateOneApplicationVariable).toHaveBeenCalledTimes(1);
    expect(canvas.getByDisplayValue('https://new.example.com')).toBeVisible();
    expect(runApplicationHealthCheck).not.toHaveBeenCalled();
    expect(
      canvas.queryByText('Your recorder plan is almost used up'),
    ).not.toBeInTheDocument();
  },
};

export const WorkspaceHealthCheckRerunsWhenItsFunctionChanges: Story = {
  ...WorkspaceHealthCheckRunsOnOpenAndAfterSave,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Your recorder plan is almost used up'),
    ).toBeVisible();
    expect(runApplicationHealthCheck).toHaveBeenCalledTimes(1);

    getWorker().use(
      ...buildApplicationHandlers({
        settingsMenuItems: [USER_SETTINGS_MENU_ITEM],
        healthCheckLogicFunctionId: '20202020-6a7b-4c3d-8e4f-000000000022',
      }),
    );
    dispatchMetadataOperationBrowserEvent({
      metadataName: 'application',
      operation: {
        type: 'update',
        updatedRecord: { id: APPLICATION_ID, version: '2.0.0' },
        updatedFields: ['version'],
      },
    });

    await waitFor(() =>
      expect(runApplicationHealthCheck).toHaveBeenCalledTimes(2),
    );
  },
};

const seedBuiltInAccountAppStory = ({
  isAppPreferencesEnabled,
}: {
  isAppPreferencesEnabled: boolean;
}) => {
  jotaiStore.set(isGoogleMessagingEnabledState.atom, true);
  jotaiStore.set(isGoogleCalendarEnabledState.atom, true);
  jotaiStore.set(isMicrosoftMessagingEnabledState.atom, false);
  jotaiStore.set(isMicrosoftCalendarEnabledState.atom, false);
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      {
        key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
        value: isAppPreferencesEnabled,
      },
    ],
  });
};

export const BuiltInAccountAppHidesSingleGeneralTab: Story = {
  args: {
    routeParams: { ':applicationId': 'google' },
  },
  beforeEach: () =>
    seedBuiltInAccountAppStory({ isAppPreferencesEnabled: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Sync emails and calendar events from your Google accounts.',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(
      canvas.queryByRole('link', { name: 'General' }),
    ).not.toBeInTheDocument();
  },
};

export const BuiltInAccountAppIsNotInstalledWhenFeatureFlagIsOff: Story = {
  args: {
    routeParams: { ':applicationId': 'google' },
  },
  beforeEach: () =>
    seedBuiltInAccountAppStory({ isAppPreferencesEnabled: false }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        /This application is not installed on this workspace/,
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
  },
};

export const BuiltInAccountAppIsNotInstalledWhenDisabledOnServer: Story = {
  args: {
    routeParams: { ':applicationId': 'outlook' },
  },
  beforeEach: () =>
    seedBuiltInAccountAppStory({ isAppPreferencesEnabled: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        /This application is not installed on this workspace/,
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
  },
};
