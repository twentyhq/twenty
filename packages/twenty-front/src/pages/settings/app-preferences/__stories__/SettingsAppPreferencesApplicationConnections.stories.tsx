import { type ComponentProps } from 'react';
import { SettingsAppPreferencesRouteGuard } from '@/settings/app-preferences/components/SettingsAppPreferencesRouteGuard';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { isFunction } from '@sniptt/guards';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined, isPlainObject } from 'twenty-shared/utils';
import { SettingsAppPreferences } from '~/pages/settings/app-preferences/SettingsAppPreferences';
import { SettingsAppPreferencesApplication } from '~/pages/settings/app-preferences/SettingsAppPreferencesApplication';
import { MOCKED_GOOGLE_CONNECTED_ACCOUNT } from '~/pages/settings/accounts/__stories__/mockedConnectedAccounts';
import {
  createTransientToken,
  disconnectAccount,
  FATHOM_APPLICATION,
  FATHOM_PROVIDER,
  FATHOM_USER_PREFERENCE,
  getAppPreferencesConnectionMocks,
  OWN_USER_WORKSPACE_ID,
  PERSONAL_FATHOM_ACCOUNT,
  prepareConnectionOwner,
  readConnectedAccounts,
  readConnectionProviders,
  saveUserPreference,
  SHARED_FATHOM_ACCOUNT,
} from '~/pages/settings/app-preferences/__stories__/mockedAppPreferencesConnections';
import { prepareAppPreferencesStory } from '~/pages/settings/app-preferences/__stories__/mockedAppPreferencesData';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

const PERSONAL_APPLICATION_PATH = getSettingsPath(
  SettingsPath.AppPreferencesApplication,
  { applicationId: FATHOM_APPLICATION.id },
);
const openOAuth = fn<typeof window.open>().mockReturnValue(null);

const expectPersonalOAuth = async (connectedAccountId?: string) => {
  await waitFor(() => expect(openOAuth).toHaveBeenCalled());
  const requestedUrl = openOAuth.mock.calls.at(-1)?.[0];
  if (!isDefined(requestedUrl)) {
    throw new Error('OAuth redirect is missing');
  }
  const url = new URL(requestedUrl);
  await expect(url.pathname).toBe('/auth/apps/authorize');
  await expect(url.searchParams.get('applicationId')).toBe(
    FATHOM_APPLICATION.id,
  );
  await expect(url.searchParams.get('providerName')).toBe(FATHOM_PROVIDER.name);
  await expect(url.searchParams.get('visibility')).toBe('user');
  await expect(url.searchParams.get('redirectLocation')).toBe(
    PERSONAL_APPLICATION_PATH,
  );
  await expect(url.searchParams.get('transientToken')).toBe(
    'personal-app-oauth-transient-token',
  );
  await expect(url.searchParams.get('reconnectingConnectedAccountId')).toBe(
    connectedAccountId ?? null,
  );
  await expect(openOAuth.mock.calls.at(-1)?.[1]).toBe('_self');
};

const ConnectionsWithNavigation = ({
  initialPath = '/settings/app-preferences',
}: {
  initialPath?: string;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
      <output aria-label="Current route">{location.pathname}</output>
      <Routes>
        <Route element={<SettingsAppPreferencesRouteGuard />}>
          <Route path="app-preferences" element={<SettingsAppPreferences />} />
          <Route
            path="app-preferences/apps/:applicationId"
            element={<SettingsAppPreferencesApplication />}
          />
        </Route>
        <Route path="accounts" element={<div>Legacy accounts page</div>} />
        <Route path="profile" element={<div>Personal profile page</div>} />
        <Route path="*" element={<Navigate to={initialPath} replace />} />
      </Routes>
    </>
  );
};

const meta: Meta<
  PageDecoratorArgs & ComponentProps<typeof SettingsAppPreferencesApplication>
> = {
  title:
    'Pages/Settings/AppPreferences/SettingsAppPreferencesApplicationConnections',
  component: SettingsAppPreferencesApplication,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/app-preferences/apps/:applicationId',
    routeParams: { ':applicationId': FATHOM_APPLICATION.id },
  },
  parameters: { layout: 'fullscreen', msw: getAppPreferencesConnectionMocks() },
  beforeEach: async ({ parameters }) => {
    const connectionMocks: unknown = parameters.msw;
    if (!isPlainObject(connectionMocks) || !isFunction(connectionMocks.reset)) {
      throw new Error('Connection fixtures must reset before each story run');
    }
    connectionMocks.reset();
    disconnectAccount.mockClear();
    createTransientToken.mockClear();
    readConnectedAccounts.mockClear();
    readConnectionProviders.mockClear();
    saveUserPreference.mockClear();
    openOAuth.mockClear();
    const restorePreferences = await prepareAppPreferencesStory();
    const restoreOwner = prepareConnectionOwner();
    const openSpy = spyOn(window, 'open').mockImplementation(openOAuth);
    return () => {
      openSpy.mockRestore();
      restoreOwner();
      restorePreferences();
    };
  },
};

export default meta;
type Story = StoryObj<
  PageDecoratorArgs & ComponentProps<typeof SettingsAppPreferencesApplication>
>;

export const ConnectionOnlyPersonalConnect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('No connected accounts'),
    ).toBeVisible();
    await expect(canvas.getByText('Permissions')).toBeVisible();
    await expect(canvas.queryByText('Blocklist')).not.toBeInTheDocument();
    await expect(
      canvas.queryByText('This app has no personal preferences to configure.'),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('link', { name: 'Apps management' }),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Add account' }));
    await expectPersonalOAuth();
    await expect(createTransientToken).toHaveBeenCalledTimes(1);
    await expect(readConnectionProviders).toHaveBeenCalledWith({
      applicationId: FATHOM_APPLICATION.id,
    });
  },
};

export const ConnectedPersonalAccountLifecycle: Story = {
  parameters: {
    msw: getAppPreferencesConnectionMocks({
      accounts: [PERSONAL_FATHOM_ACCOUNT],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await expect(await canvas.findByText('My Fathom account')).toBeVisible();
    await expect(canvas.getByText('public_api')).toBeVisible();
    await expect(canvas.getByText('Connected')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await expect(
      body.queryByRole('menuitem', { name: /Delete/ }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Disconnect account' }),
    );
    const dialog = await body.findByRole('dialog', {
      name: 'Disconnect account',
    });
    await expect(disconnectAccount).not.toHaveBeenCalled();
    await expect(dialog).toHaveTextContent('its credentials will be removed');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    );
    await expect(disconnectAccount).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Disconnect account' }),
    );
    await userEvent.click(
      within(
        await body.findByRole('dialog', { name: 'Disconnect account' }),
      ).getByRole('button', { name: 'Disconnect account' }),
    );
    await waitFor(() =>
      expect(disconnectAccount).toHaveBeenCalledWith({
        id: PERSONAL_FATHOM_ACCOUNT.id,
      }),
    );
    await expect(await canvas.findByText('Disconnected')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await expect(
      body.queryByRole('menuitem', { name: 'Disconnect account' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Reconnect' }),
    );
    await expectPersonalOAuth(PERSONAL_FATHOM_ACCOUNT.id);
  },
};

export const FailedAccountReconnect: Story = {
  parameters: {
    msw: getAppPreferencesConnectionMocks({
      accounts: [
        {
          ...PERSONAL_FATHOM_ACCOUNT,
          authFailedAt: '2026-10-08T00:00:00.000Z',
        },
      ],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await expect(
      await canvas.findByText('Authentication failed'),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Reconnect' }),
    );
    await expectPersonalOAuth(PERSONAL_FATHOM_ACCOUNT.id);
  },
};

export const SharedAccountsAreReadOnlyAndNotDeduplicated: Story = {
  parameters: {
    msw: getAppPreferencesConnectionMocks({
      accounts: [
        PERSONAL_FATHOM_ACCOUNT,
        SHARED_FATHOM_ACCOUNT,
        {
          ...SHARED_FATHOM_ACCOUNT,
          id: '20202020-0000-4000-8000-00000000b008',
          name: 'Other app account',
          applicationId: '20202020-0000-4000-8000-00000000b009',
        },
      ],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('My Fathom account');
    await expect(canvas.getByText('Shared Fathom account')).toBeVisible();
    await expect(canvas.getByText('Shared account')).toBeVisible();
    await expect(
      canvas.queryByText('Other app account'),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getAllByRole('button', { name: 'More options' }),
    ).toHaveLength(1);
    await expect(canvas.getAllByText('public_api')).toHaveLength(2);
    await expect(disconnectAccount).not.toHaveBeenCalled();
  },
};

export const OwnWorkspaceSharedAccountIsReadOnly: Story = {
  parameters: {
    msw: getAppPreferencesConnectionMocks({
      accounts: [{ ...PERSONAL_FATHOM_ACCOUNT, visibility: 'workspace' }],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Shared account');
    await expect(
      canvas.queryByRole('button', { name: 'More options' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Add account' }),
    ).toBeEnabled();
  },
};

export const BothConnectionsAndPersonalPreferences: Story = {
  parameters: {
    msw: getAppPreferencesConnectionMocks({
      accounts: [PERSONAL_FATHOM_ACCOUNT],
      applicationVariables: [FATHOM_USER_PREFERENCE],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('My Fathom account');
    const input = within(
      await canvas.findByRole('group', { name: 'Meeting prefix' }),
    ).getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Review');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(saveUserPreference).toHaveBeenCalledWith({
        applicationUniversalIdentifier: FATHOM_APPLICATION.universalIdentifier,
        key: FATHOM_USER_PREFERENCE.key,
        value: 'Review',
      }),
    );
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Save' }),
      ).not.toBeInTheDocument(),
    );
    await expect(canvas.getByText('Connected')).toBeVisible();
  },
};

export const NoAccountsPermissionKeepsPreferencesEditable: Story = {
  beforeEach: () => prepareAppPreferencesStory({ permissionFlags: [] }),
  parameters: {
    msw: getAppPreferencesConnectionMocks({
      canManageConnectedAccounts: false,
      applicationVariables: [FATHOM_USER_PREFERENCE],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(
        'Your role does not allow managing connected accounts.',
      ),
    ).toBeVisible();
    const input = within(
      canvas.getByRole('group', { name: 'Meeting prefix' }),
    ).getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Personal');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(saveUserPreference).toHaveBeenCalledWith({
        applicationUniversalIdentifier: FATHOM_APPLICATION.universalIdentifier,
        key: FATHOM_USER_PREFERENCE.key,
        value: 'Personal',
      }),
    );
    await expect(
      canvas.queryByRole('button', { name: 'Add account' }),
    ).not.toBeInTheDocument();
    await expect(readConnectedAccounts).not.toHaveBeenCalled();
    await expect(readConnectionProviders).not.toHaveBeenCalled();
  },
};

export const VariableOnlyHiddenFieldsEmptyState: Story = {
  beforeEach: () => prepareAppPreferencesStory({ permissionFlags: [] }),
  parameters: {
    msw: getAppPreferencesConnectionMocks({
      application: { ...FATHOM_APPLICATION, hasConnectionProviders: false },
      canManageConnectedAccounts: false,
      applicationVariables: [
        { ...FATHOM_USER_PREFERENCE, value: '', isDeprecated: true },
      ],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(
        'This app has no personal preferences to configure.',
      ),
    ).toBeVisible();
    await expect(canvas.queryByText('Accounts')).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('group', { name: 'Meeting prefix' }),
    ).not.toBeInTheDocument();
    await expect(readConnectedAccounts).not.toHaveBeenCalled();
    await expect(readConnectionProviders).not.toHaveBeenCalled();
  },
};

export const AccountLoadingAndRetry: Story = {
  parameters: {
    msw: getAppPreferencesConnectionMocks({
      accounts: [PERSONAL_FATHOM_ACCOUNT],
      failFirstAccountRead: true,
      accountReadDelay: 250,
      applicationVariables: [FATHOM_USER_PREFERENCE],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Accounts used by Fathom');
    await expect(
      canvas.queryByRole('button', { name: 'Add account' }),
    ).not.toBeInTheDocument();
    await expect(
      await canvas.findByText('Unable to load connected accounts.'),
    ).toBeVisible();
    const input = within(
      canvas.getByRole('group', { name: 'Meeting prefix' }),
    ).getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Draft during account error');
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await expect(await canvas.findByText('My Fathom account')).toBeVisible();
    await expect(input).toHaveValue('Draft during account error');
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeEnabled();
    await expect(
      canvas.getByRole('button', { name: 'Add account' }),
    ).toBeEnabled();
  },
};

export const ProviderErrorDoesNotBlockPreferenceSave: Story = {
  parameters: {
    msw: getAppPreferencesConnectionMocks({
      failFirstProviderRead: true,
      applicationVariables: [FATHOM_USER_PREFERENCE],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Unable to load connected accounts.');
    const input = within(
      canvas.getByRole('group', { name: 'Meeting prefix' }),
    ).getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Saved despite connection error');
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await expect(
      await canvas.findByText('No connected accounts'),
    ).toBeVisible();
    await expect(input).toHaveValue('Saved despite connection error');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(saveUserPreference).toHaveBeenCalledWith({
        applicationUniversalIdentifier: FATHOM_APPLICATION.universalIdentifier,
        key: FATHOM_USER_PREFERENCE.key,
        value: 'Saved despite connection error',
      }),
    );
  },
};

export const UnconfiguredProviderCannotConnect: Story = {
  parameters: {
    msw: getAppPreferencesConnectionMocks({
      connectionProviders: [
        {
          ...FATHOM_PROVIDER,
          oauth: {
            scopes: ['public_api'],
            isClientCredentialsConfigured: false,
          },
        },
      ],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(
        'Account connections are not configured for this app. Contact your administrator for help.',
      ),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Add account' }),
    ).toBeDisabled();
    await expect(createTransientToken).not.toHaveBeenCalled();
  },
};

export const ConnectErrorAndRetry: Story = {
  parameters: {
    msw: getAppPreferencesConnectionMocks({ failFirstConnect: true }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Add account' }),
    );
    await expect(
      await canvas.findByText('Unable to connect account. Try again.'),
    ).toBeVisible();
    await expect(openOAuth).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Add account' }));
    await expectPersonalOAuth();
    await expect(createTransientToken).toHaveBeenCalledTimes(2);
  },
};

export const DisconnectErrorAndRetry: Story = {
  parameters: {
    msw: getAppPreferencesConnectionMocks({
      accounts: [PERSONAL_FATHOM_ACCOUNT],
      failFirstDisconnect: true,
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Connected');
    for (const attempt of [1, 2]) {
      await userEvent.click(
        canvas.getByRole('button', { name: 'More options' }),
      );
      await userEvent.click(
        await body.findByRole('menuitem', { name: 'Disconnect account' }),
      );
      await userEvent.click(
        within(
          await body.findByRole('dialog', { name: 'Disconnect account' }),
        ).getByRole('button', { name: 'Disconnect account' }),
      );
      if (attempt === 1) {
        await expect(
          await canvas.findByText('Unable to disconnect account. Try again.'),
        ).toBeVisible();
        await expect(canvas.getByText('Connected')).toBeVisible();
      }
    }
    await expect(await canvas.findByText('Disconnected')).toBeVisible();
    await expect(disconnectAccount).toHaveBeenCalledTimes(2);
  },
};

export const ConnectionOnlyOverviewAndBackNavigation: Story = {
  args: { routePath: '/settings/*', routeParams: { ':*': 'app-preferences' } },
  render: () => <ConnectionsWithNavigation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const appRow = await canvas.findByRole('link', { name: /Fathom/ });
    await expect(within(appRow).getByText('Missing account')).toBeVisible();
    await userEvent.click(appRow);
    await expect(
      await canvas.findByText('No connected accounts'),
    ).toBeVisible();
    await expect(canvas.getByLabelText('Current route')).toHaveTextContent(
      PERSONAL_APPLICATION_PATH,
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
    await expect(
      await canvas.findByRole('link', { name: /Fathom/ }),
    ).toBeVisible();
    await expect(canvas.getByLabelText('Current route')).toHaveTextContent(
      '/settings/app-preferences',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Forward' }));
    await expect(
      await canvas.findByText('No connected accounts'),
    ).toBeVisible();
    await expect(canvas.getByLabelText('Current route')).toHaveTextContent(
      PERSONAL_APPLICATION_PATH,
    );
  },
};

export const SharedUsableAccountSatisfiesAppReadiness: Story = {
  args: { routePath: '/settings/*', routeParams: { ':*': 'app-preferences' } },
  render: () => <ConnectionsWithNavigation />,
  parameters: {
    msw: getAppPreferencesConnectionMocks({
      accounts: [SHARED_FATHOM_ACCOUNT],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Shared Fathom account');
    const appRow = canvas.getByRole('link', { name: 'Fathom' });
    await expect(
      within(appRow).queryByText('Missing account'),
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole('img', { name: 'Fathom' })).toBeVisible();
    await expect(canvas.getAllByText('Account')).toHaveLength(1);
    await expect(
      canvas.getAllByRole('button', { name: 'Add account' }),
    ).toHaveLength(1);
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'App preferences' }),
    );
    await expect(await canvas.findByText('Shared account')).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'More options' }),
    ).not.toBeInTheDocument();
  },
};

export const DisconnectedAccountShowsMissingAccount: Story = {
  args: { routePath: '/settings/*', routeParams: { ':*': 'app-preferences' } },
  render: () => <ConnectionsWithNavigation />,
  parameters: {
    msw: getAppPreferencesConnectionMocks({
      accounts: [
        { ...PERSONAL_FATHOM_ACCOUNT, archivedAt: '2026-10-08T00:00:00.000Z' },
      ],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Disconnected');
    await expect(
      within(
        canvas.getByRole('link', { name: 'Fathom Missing account' }),
      ).getByText('Missing account'),
    ).toBeVisible();
  },
};

export const CombinedAccountsKeepActualAppUsage: Story = {
  args: { routePath: '/settings/*', routeParams: { ':*': 'app-preferences' } },
  render: () => <ConnectionsWithNavigation />,
  parameters: {
    msw: getAppPreferencesConnectionMocks({
      builtInAccounts: [
        {
          ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
          userWorkspaceId: OWN_USER_WORKSPACE_ID,
        },
      ],
      accounts: [
        {
          ...PERSONAL_FATHOM_ACCOUNT,
          handle: MOCKED_GOOGLE_CONNECTED_ACCOUNT.handle,
        },
      ],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('My Fathom account');
    await expect(
      canvas.getByText(MOCKED_GOOGLE_CONNECTED_ACCOUNT.handle),
    ).toBeVisible();
    await expect(canvas.getByRole('img', { name: 'Fathom' })).toBeVisible();
    await expect(canvas.getByRole('img', { name: 'Gmail' })).toBeVisible();
    await expect(
      canvas.getByRole('img', { name: 'Google Calendar' }),
    ).toBeVisible();
    await expect(canvas.getAllByText('Account')).toHaveLength(1);
    await expect(canvas.getAllByText('Used by')).toHaveLength(1);
    await expect(
      canvas.getAllByRole('button', { name: 'Add account' }),
    ).toHaveLength(1);
    await expect(
      canvas.getAllByRole('button', { name: 'More options' }),
    ).toHaveLength(2);
    await expect(
      within(canvas.getByRole('link', { name: 'Fathom' })).queryByText(
        'Missing account',
      ),
    ).not.toBeInTheDocument();
  },
};

export const FeatureFlagOffReturnsToLegacyAccounts: Story = {
  args: {
    routePath: '/settings/*',
    routeParams: { ':*': `app-preferences/apps/${FATHOM_APPLICATION.id}` },
  },
  render: () => (
    <ConnectionsWithNavigation initialPath={PERSONAL_APPLICATION_PATH} />
  ),
  parameters: {
    msw: getAppPreferencesConnectionMocks({ isAppPreferencesEnabled: false }),
  },
  beforeEach: () =>
    prepareAppPreferencesStory({ isAppPreferencesEnabled: false }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Legacy accounts page')).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Add account' }),
    ).not.toBeInTheDocument();
    await expect(readConnectedAccounts).not.toHaveBeenCalled();
    await expect(readConnectionProviders).not.toHaveBeenCalled();
  },
};
