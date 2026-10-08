import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { SettingsAppPreferencesRouteGuard } from '@/settings/app-preferences/components/SettingsAppPreferencesRouteGuard';
import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
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
import { MessageChannelType, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined, isPlainObject } from 'twenty-shared/utils';
import {
  CalendarChannelVisibility,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import {
  MOCKED_GOOGLE_CONNECTED_ACCOUNT,
  MOCKED_PAUSED_GOOGLE_ACCOUNT,
  MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
} from '~/pages/settings/accounts/__stories__/mockedConnectedAccounts';
import { SettingsAppPreferences } from '~/pages/settings/app-preferences/SettingsAppPreferences';
import { SettingsAppPreferencesAccount } from '~/pages/settings/app-preferences/SettingsAppPreferencesAccount';
import { SettingsAppPreferencesApplication } from '~/pages/settings/app-preferences/SettingsAppPreferencesApplication';
import { SettingsAppPreferencesBuiltInApplication } from '~/pages/settings/app-preferences/SettingsAppPreferencesBuiltInApplication';
import {
  getAccountEntryMocks,
  nativeAccountReads,
  nativeCalendarReads,
  nativeMessageReads,
} from '~/pages/settings/app-preferences/__stories__/mockedAppPreferencesAccount';
import {
  calendarChannelUpdates,
  calendarChannelQueries,
  messageChannelUpdates,
  messageFolderQueries,
  MOCKED_SECOND_GOOGLE_ACCOUNT,
} from '~/pages/settings/app-preferences/__stories__/mockedAppPreferencesChannels';
import {
  createTransientToken,
  disconnectAccount,
  FATHOM_APPLICATION,
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
import {
  getAppPreferencesMocks,
  prepareAppPreferencesStory,
} from '~/pages/settings/app-preferences/__stories__/mockedAppPreferencesData';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { ToastStoryContainer } from '~/testing/components/ToastStoryContainer';

const getAccountPath = (connectedAccountId: string) =>
  getSettingsPath(SettingsPath.AppPreferencesAccount, { connectedAccountId });
const GOOGLE_ACCOUNT_PATH = getAccountPath(MOCKED_GOOGLE_CONNECTED_ACCOUNT.id);
const FATHOM_ACCOUNT_PATH = getAccountPath(PERSONAL_FATHOM_ACCOUNT.id);
const openOAuth = fn<typeof window.open>().mockReturnValue(null);
const SHARED_NATIVE_CALENDAR_ACCOUNT: ConnectedAccount = {
  ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
  userWorkspaceId: 'another-owner',
  visibility: 'workspace',
  messageChannels: [],
};

const AccountPreferencesWithNavigation = ({
  initialPath = GOOGLE_ACCOUNT_PATH,
}: {
  initialPath?: string;
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
      <output aria-label="Current preferences URL">
        {location.pathname}
        {location.search}
        {location.hash}
      </output>
      <Routes>
        <Route element={<SettingsAppPreferencesRouteGuard />}>
          <Route path="app-preferences" element={<SettingsAppPreferences />} />
          <Route
            path="app-preferences/apps/:applicationId"
            element={<SettingsAppPreferencesApplication />}
          />
          <Route
            element={
              <SettingsProtectedRouteWrapper
                settingsPermission={PermissionFlagType.CONNECTED_ACCOUNTS}
              />
            }
          >
            <Route
              path="app-preferences/accounts/:connectedAccountId"
              element={<SettingsAppPreferencesAccount />}
            />
            <Route
              path="app-preferences/built-in/:builtInAppId"
              element={<SettingsAppPreferencesBuiltInApplication />}
            />
          </Route>
        </Route>
        <Route path="accounts" element={<div>Legacy accounts page</div>} />
        <Route path="profile" element={<div>Personal profile page</div>} />
        <Route path="*" element={<Navigate to={initialPath} replace />} />
      </Routes>
    </>
  );
};

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/AppPreferences/SettingsAppPreferencesAccount',
  component: SettingsAppPreferencesAccount,
  decorators: [PageDecorator],
  render: () => <AccountPreferencesWithNavigation />,
  args: { routePath: '/settings/*', routeParams: {} },
  parameters: { layout: 'fullscreen', msw: getAccountEntryMocks() },
  beforeEach: async ({ parameters }) => {
    const accountMocks: unknown = parameters.msw;
    if (!isPlainObject(accountMocks) || !isFunction(accountMocks.reset)) {
      throw new Error('Account fixtures must reset before each story run');
    }
    accountMocks.reset();
    disconnectAccount.mockClear();
    createTransientToken.mockClear();
    readConnectedAccounts.mockClear();
    readConnectionProviders.mockClear();
    saveUserPreference.mockClear();
    openOAuth.mockClear();
    const restorePreferences = await prepareAppPreferencesStory();
    const previousCookieAuthActive = jotaiStore.get(
      isCookieAuthActiveState.atom,
    );
    jotaiStore.set(isCookieAuthActiveState.atom, true);
    const openSpy = spyOn(window, 'open').mockImplementation(openOAuth);
    return () => {
      openSpy.mockRestore();
      jotaiStore.set(isCookieAuthActiveState.atom, previousCookieAuthActive);
      restorePreferences();
    };
  },
};

export default meta;
type Story = StoryObj<PageDecoratorArgs>;

export const NativeAccountSharesPreferencesWithApps: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Import');
    await expect(canvas.getByRole('link', { name: 'Emails' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvas.getByRole('link', { name: 'Calendar' })).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Account' }),
    ).not.toBeInTheDocument();
    await expect(canvas.queryByText('Blocklist')).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('switch', { name: 'Exclude group emails' }),
    );
    await waitFor(() =>
      expect(messageChannelUpdates).toHaveBeenLastCalledWith({
        id: 'google-email-channel',
        update: { excludeGroupEmails: true },
      }),
    );
    await userEvent.click(
      canvas.getByRole('link', { name: 'Gmail preferences' }),
    );
    await expect(
      canvas.getByLabelText('Current preferences URL'),
    ).toHaveTextContent(
      '/built-in/gmail?connectedAccountId=google-connected-account#messaging',
    );
    await expect(
      await canvas.findByRole('switch', { name: 'Exclude group emails' }),
    ).toBeChecked();
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
    await expect(
      await canvas.findByRole('link', { name: 'Emails' }),
    ).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('link', { name: 'Calendar' }));
    await userEvent.click(
      await canvas.findByRole('radio', { name: 'Metadata' }),
    );
    await waitFor(() =>
      expect(calendarChannelUpdates).toHaveBeenLastCalledWith({
        id: 'google-calendar-channel',
        update: { visibility: CalendarChannelVisibility.METADATA },
      }),
    );
    await userEvent.click(
      canvas.getByRole('link', { name: 'Google Calendar preferences' }),
    );
    await expect(
      canvas.getByLabelText('Current preferences URL'),
    ).toHaveTextContent(
      '/built-in/google-calendar?connectedAccountId=google-connected-account#calendar',
    );
    await expect(
      await canvas.findByRole('radio', { name: 'Metadata' }),
    ).toBeChecked();
    await expect(
      canvas.queryByRole('link', { name: 'Messaging' }),
    ).not.toBeInTheDocument();
  },
};

export const CalendarOnlyOutlookHasNoEmailsTab: Story = {
  render: () => (
    <AccountPreferencesWithNavigation
      initialPath={getAccountPath(MOCKED_OUTLOOK_CALENDAR_ACCOUNT.id)}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Event visibility');
    await expect(
      canvas.getByRole('link', { name: 'Calendar' }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(
      canvas.queryByRole('link', { name: 'Emails' }),
    ).not.toBeInTheDocument();
    await expect(canvas.queryByText('Import')).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('link', { name: 'Outlook preferences' }),
    );
    await userEvent.click(await canvas.findByRole('link', { name: 'General' }));
    await expect(await canvas.findByText('Blocklist')).toBeVisible();
  },
};

export const DuplicateHandlesKeepAccountAndFolderIds: Story = {
  parameters: {
    msw: getAccountEntryMocks({
      accounts: [
        MOCKED_GOOGLE_CONNECTED_ACCOUNT,
        {
          ...MOCKED_SECOND_GOOGLE_ACCOUNT,
          handle: MOCKED_GOOGLE_CONNECTED_ACCOUNT.handle,
        },
      ],
    }),
  },
  render: () => (
    <AccountPreferencesWithNavigation
      initialPath={getAccountPath(MOCKED_SECOND_GOOGLE_ACCOUNT.id)}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('Second Account Folder'),
    ).toBeVisible();
    await expect(
      canvas.queryByText('First Account Folder'),
    ).not.toBeInTheDocument();
    await expect(messageFolderQueries).toHaveBeenLastCalledWith(
      'second-google-message-channel',
    );
    await expect(messageFolderQueries).not.toHaveBeenCalledWith(undefined);
    await userEvent.click(
      canvas.getByRole('switch', { name: 'Exclude group emails' }),
    );
    await waitFor(() =>
      expect(messageChannelUpdates).toHaveBeenLastCalledWith({
        id: 'second-google-message-channel',
        update: { excludeGroupEmails: true },
      }),
    );
    await userEvent.click(
      canvas.getByRole('link', { name: 'Gmail preferences' }),
    );
    await expect(
      canvas.getByLabelText('Current preferences URL'),
    ).toHaveTextContent('connectedAccountId=second-google-account#messaging');
    await expect(
      await canvas.findByText('Second Account Folder'),
    ).toBeVisible();
  },
};

export const AccountTabsFollowBrowserHistoryAndBareRevisit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Import');
    await userEvent.click(canvas.getByRole('link', { name: 'Calendar' }));
    await canvas.findByText('Event visibility');
    await expect(
      canvas.getByLabelText('Current preferences URL'),
    ).toHaveTextContent(`${GOOGLE_ACCOUNT_PATH}#calendar`);
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
    await canvas.findByText('Import');
    await expect(canvas.getByRole('link', { name: 'Emails' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      canvas.queryByText('Event visibility'),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Forward' }));
    await canvas.findByText('Event visibility');
    await expect(
      canvas.getByRole('link', { name: 'Calendar' }),
    ).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('link', { name: 'Apps' }));
    await userEvent.click(
      await canvas.findByRole('link', {
        name: MOCKED_GOOGLE_CONNECTED_ACCOUNT.handle,
      }),
    );
    await canvas.findByText('Import');
    await expect(canvas.getByRole('link', { name: 'Emails' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      canvas.getByLabelText('Current preferences URL'),
    ).toHaveTextContent(GOOGLE_ACCOUNT_PATH);
  },
};

export const AccountChangesAndHistoryKeepFolderQueriesScoped: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('radio', { name: 'Some folders' }),
    );
    await expect(await canvas.findByText('First Account Folder')).toBeVisible();
    await expect(messageFolderQueries).toHaveBeenLastCalledWith(
      'google-email-channel',
    );
    await userEvent.click(canvas.getByRole('link', { name: 'Apps' }));
    await userEvent.click(
      await canvas.findByRole('link', {
        name: MOCKED_SECOND_GOOGLE_ACCOUNT.handle,
      }),
    );
    await expect(
      await canvas.findByText('Second Account Folder'),
    ).toBeVisible();
    await expect(
      canvas.queryByText('First Account Folder'),
    ).not.toBeInTheDocument();
    await expect(messageFolderQueries).toHaveBeenLastCalledWith(
      'second-google-message-channel',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
    await canvas.findByRole('link', {
      name: MOCKED_GOOGLE_CONNECTED_ACCOUNT.handle,
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
    await expect(await canvas.findByText('First Account Folder')).toBeVisible();
    await expect(
      canvas.queryByText('Second Account Folder'),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('switch', { name: 'Exclude group emails' }),
    );
    await waitFor(() =>
      expect(messageChannelUpdates).toHaveBeenLastCalledWith({
        id: 'google-email-channel',
        update: { excludeGroupEmails: true },
      }),
    );
    await expect(messageFolderQueries).not.toHaveBeenCalledWith(undefined);
  },
};

export const InvalidHashFallsBackToFirstBoundView: Story = {
  render: () => (
    <AccountPreferencesWithNavigation
      initialPath={`${GOOGLE_ACCOUNT_PATH}#drive`}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Import');
    await expect(canvas.getByRole('link', { name: 'Emails' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      canvas.queryByRole('link', { name: 'Drive' }),
    ).not.toBeInTheDocument();
  },
};

export const ArchivedAccountRetainsIdentityAndAppLink: Story = {
  parameters: {
    msw: getAccountEntryMocks({ accounts: [MOCKED_PAUSED_GOOGLE_ACCOUNT] }),
  },
  render: () => (
    <AccountPreferencesWithNavigation
      initialPath={getAccountPath(MOCKED_PAUSED_GOOGLE_ACCOUNT.id)}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      (await canvas.findAllByText(MOCKED_PAUSED_GOOGLE_ACCOUNT.handle))[0],
    ).toBeVisible();
    await expect(canvas.getByText('Sync paused')).toBeVisible();
    await expect(
      canvas.getByText(
        'This account is disconnected. Reconnect it in app preferences to continue syncing.',
      ),
    ).toBeVisible();
    await expect(canvas.queryByRole('radio')).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('link', { name: 'Google Calendar preferences' }),
    );
    await expect(
      canvas.getByLabelText('Current preferences URL'),
    ).toHaveTextContent('connectedAccountId=paused-connected-account#general');
    await expect(await canvas.findByText('Blocklist')).toBeVisible();
    await expect(calendarChannelUpdates).not.toHaveBeenCalled();
  },
};

export const PausedEmailRemainsBoundWithoutEditableControls: Story = {
  parameters: {
    msw: getAccountEntryMocks({
      accounts: [
        {
          ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
          calendarChannels: [],
          messageChannels: [
            {
              ...MOCKED_GOOGLE_CONNECTED_ACCOUNT.messageChannels[0],
              isSyncEnabled: false,
            },
          ],
        },
      ],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole('link', { name: 'Emails' }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(
      canvas.getByText(
        'Preferences are unavailable until this account is configured and syncing.',
      ),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('switch', { name: 'Exclude group emails' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: 'Gmail preferences' }),
    ).toHaveAttribute(
      'href',
      '/settings/app-preferences/built-in/gmail?connectedAccountId=google-connected-account#general',
    );
    await expect(messageFolderQueries).not.toHaveBeenCalled();
  },
};

export const NonEmailChannelsDoNotCreateNativeEmailView: Story = {
  parameters: {
    msw: getAccountEntryMocks({
      accounts: [
        {
          ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
          calendarChannels: [],
          messageChannels: [
            {
              ...MOCKED_GOOGLE_CONNECTED_ACCOUNT.messageChannels[0],
              type: MessageChannelType.APP,
            },
          ],
        },
      ],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('No apps are using this account.'),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('link', { name: 'Emails' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('switch', { name: 'Exclude group emails' }),
    ).not.toBeInTheDocument();
    await expect(messageChannelUpdates).not.toHaveBeenCalled();
  },
};

export const AccountReadErrorCanRetryWithoutShowingMissing: Story = {
  parameters: { msw: getAccountEntryMocks({ failFirstAccountRead: true }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('Unable to load account preferences.'),
    ).toBeVisible();
    await expect(
      canvas.queryByText(
        'This account is no longer available or you do not have access to it.',
      ),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await expect(await canvas.findByText('Import')).toBeVisible();
    await expect(nativeAccountReads).toHaveBeenCalledTimes(2);
  },
};

export const ChannelReadErrorCanRetryWithoutBorrowingChannels: Story = {
  parameters: { msw: getAccountEntryMocks({ failFirstMessageRead: true }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('Unable to load account preferences.'),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('switch', { name: 'Exclude group emails' }),
    ).not.toBeInTheDocument();
    await expect(messageFolderQueries).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await expect(await canvas.findByText('Import')).toBeVisible();
    await expect(nativeMessageReads).toHaveBeenCalledTimes(2);
  },
};

export const UnknownOrInaccessibleAccountDoesNotSelectAnother: Story = {
  render: () => (
    <AccountPreferencesWithNavigation
      initialPath={getAccountPath('inaccessible-account')}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(
        'This account is no longer available or you do not have access to it.',
      ),
    ).toBeVisible();
    await expect(canvas.queryByText('Import')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('radio')).not.toBeInTheDocument();
    await expect(messageFolderQueries).not.toHaveBeenCalled();
    await expect(messageChannelUpdates).not.toHaveBeenCalled();
  },
};

export const NativeGeneralAccountRowAndMenuNavigateIndependently: Story = {
  render: () => (
    <AccountPreferencesWithNavigation initialPath="/settings/app-preferences/built-in/gmail" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const secondAccountLink = await canvas.findByRole('link', {
      name: MOCKED_SECOND_GOOGLE_ACCOUNT.handle,
    });
    const row = secondAccountLink.closest<HTMLElement>('[data-table-row]');
    if (!isDefined(row)) {
      throw new Error('Second account row is missing');
    }
    await userEvent.click(
      within(row).getByRole('button', { name: 'More options' }),
    );
    await expect(
      canvas.getByLabelText('Current preferences URL'),
    ).toHaveTextContent('/built-in/gmail');
    await expect(canvas.getByText('Blocklist')).toBeVisible();
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Emails settings' }),
    );
    await expect(
      await canvas.findByText('Second Account Folder'),
    ).toBeVisible();
    await expect(
      canvas.getByLabelText('Current preferences URL'),
    ).toHaveTextContent('connectedAccountId=second-google-account#messaging');
    await userEvent.click(canvas.getByRole('link', { name: 'General' }));
    await userEvent.click(
      await canvas.findByRole('link', {
        name: MOCKED_SECOND_GOOGLE_ACCOUNT.handle,
      }),
    );
    await expect(
      await canvas.findByText('Second Account Folder'),
    ).toBeVisible();
    await expect(
      canvas.getByLabelText('Current preferences URL'),
    ).toHaveTextContent(getAccountPath(MOCKED_SECOND_GOOGLE_ACCOUNT.id));
    await expect(messageFolderQueries).not.toHaveBeenCalledWith(undefined);
  },
};

export const InstalledAccountKeepsAppScopedVariablesAndSelectedControls: Story =
  {
    parameters: {
      msw: getAppPreferencesConnectionMocks({
        accounts: [PERSONAL_FATHOM_ACCOUNT, SHARED_FATHOM_ACCOUNT],
        builtInAccounts: [
          {
            ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
            userWorkspaceId: OWN_USER_WORKSPACE_ID,
          },
        ],
        applicationVariables: [FATHOM_USER_PREFERENCE],
      }),
    },
    beforeEach: () => prepareConnectionOwner(),
    render: () => (
      <ToastStoryContainer>
        <AccountPreferencesWithNavigation initialPath="/settings/app-preferences" />
      </ToastStoryContainer>
    ),
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const body = within(canvasElement.ownerDocument.body);
      const rowLink = await canvas.findByRole('link', {
        name: /My Fathom account/,
      });
      const row = rowLink.closest<HTMLElement>('[data-table-row]');
      if (!isDefined(row)) {
        throw new Error('Installed account row is missing');
      }
      await userEvent.click(
        within(row).getByRole('button', { name: 'More options' }),
      );
      await expect(
        canvas.getByLabelText('Current preferences URL'),
      ).toHaveTextContent('/settings/app-preferences');
      await expect(
        await body.findByRole('menuitem', { name: 'App preferences' }),
      ).toBeVisible();
      await userEvent.keyboard('{Escape}');
      await userEvent.click(rowLink);
      await expect(await canvas.findByText('My Fathom account')).toBeVisible();
      await waitFor(() =>
        expect(
          canvas.getAllByText(PERSONAL_FATHOM_ACCOUNT.handle)[0],
        ).toBeVisible(),
      );
      await expect(
        canvas.queryByText('Shared Fathom account'),
      ).not.toBeInTheDocument();
      await expect(
        canvas.queryByRole('button', { name: 'Add account' }),
      ).not.toBeInTheDocument();
      await expect(
        canvas.getByRole('link', { name: 'Fathom' }),
      ).toHaveAttribute('aria-current', 'page');
      const field = within(
        canvas.getByRole('group', { name: 'Meeting prefix' }),
      ).getByRole('textbox');
      await userEvent.clear(field);
      await userEvent.type(field, 'Personal');
      await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
      await waitFor(() =>
        expect(saveUserPreference).toHaveBeenCalledWith({
          applicationUniversalIdentifier:
            FATHOM_APPLICATION.universalIdentifier,
          key: 'MEETING_PREFIX',
          value: 'Personal',
        }),
      );
      await canvas.findByText('Preferences saved.');
      await waitFor(() =>
        expect(
          canvas.queryByRole('button', { name: 'Save' }),
        ).not.toBeInTheDocument(),
      );
      await userEvent.click(canvas.getByRole('link', { name: 'Apps' }));
      const appLink = (
        await canvas.findAllByRole('link', { name: /Fathom/ })
      ).find(
        (link) =>
          link.getAttribute('href') ===
          '/settings/app-preferences/apps/' + FATHOM_APPLICATION.id,
      );
      if (!isDefined(appLink)) {
        throw new Error('Fathom preferences link is missing');
      }
      await userEvent.click(appLink);
      await expect(
        await canvas.findByRole('group', { name: 'Meeting prefix' }),
      ).toBeVisible();
      await waitFor(() =>
        expect(
          within(
            canvas.getByRole('group', { name: 'Meeting prefix' }),
          ).getByRole('textbox'),
        ).toHaveValue('Personal'),
      );
      await expect(
        await canvas.findByText('Shared Fathom account'),
      ).toBeVisible();
    },
  };

export const InstalledSharedAccountIsReadOnlyWithEditableUserPreferences: Story =
  {
    parameters: {
      msw: getAppPreferencesConnectionMocks({
        accounts: [PERSONAL_FATHOM_ACCOUNT, SHARED_FATHOM_ACCOUNT],
        applicationVariables: [FATHOM_USER_PREFERENCE],
      }),
    },
    beforeEach: () => prepareConnectionOwner(),
    render: () => (
      <AccountPreferencesWithNavigation
        initialPath={getAccountPath(SHARED_FATHOM_ACCOUNT.id)}
      />
    ),
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      await expect(
        await canvas.findByText('Shared Fathom account'),
      ).toBeVisible();
      await expect(
        canvas.queryByText('My Fathom account'),
      ).not.toBeInTheDocument();
      await expect(
        canvas.queryByRole('button', { name: 'More options' }),
      ).not.toBeInTheDocument();
      await expect(
        canvas.queryByRole('button', { name: 'Add account' }),
      ).not.toBeInTheDocument();
      const field = within(
        canvas.getByRole('group', { name: 'Meeting prefix' }),
      ).getByRole('textbox');
      await userEvent.type(field, ' notes');
      await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
      await waitFor(() =>
        expect(saveUserPreference).toHaveBeenCalledWith({
          applicationUniversalIdentifier:
            FATHOM_APPLICATION.universalIdentifier,
          key: 'MEETING_PREFIX',
          value: 'Meeting notes',
        }),
      );
      await expect(disconnectAccount).not.toHaveBeenCalled();
      await expect(createTransientToken).not.toHaveBeenCalled();
    },
  };

export const InstalledDisconnectedAccountReconnectReturnsToAccount: Story = {
  parameters: {
    msw: getAppPreferencesConnectionMocks({
      accounts: [
        { ...PERSONAL_FATHOM_ACCOUNT, archivedAt: '2026-10-08T00:00:00Z' },
      ],
    }),
  },
  beforeEach: () => prepareConnectionOwner(),
  render: () => (
    <AccountPreferencesWithNavigation initialPath={FATHOM_ACCOUNT_PATH} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await expect(await canvas.findByText('Disconnected')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await expect(
      body.queryByRole('menuitem', { name: 'Disconnect account' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Reconnect' }),
    );
    await waitFor(() => expect(openOAuth).toHaveBeenCalled());
    const requestedUrl = openOAuth.mock.calls.at(-1)?.[0];
    if (!isDefined(requestedUrl)) {
      throw new Error('Personal reconnect URL is missing');
    }
    const url = new URL(requestedUrl);
    await expect(url.searchParams.get('redirectLocation')).toBe(
      FATHOM_ACCOUNT_PATH,
    );
    await expect(url.searchParams.get('reconnectingConnectedAccountId')).toBe(
      PERSONAL_FATHOM_ACCOUNT.id,
    );
    await expect(url.searchParams.get('visibility')).toBe('user');
    await expect(
      canvas.getByLabelText('Current preferences URL'),
    ).toHaveTextContent(FATHOM_ACCOUNT_PATH);
  },
};

export const SharedNativeMessagingDoesNotGrantMemberWrites: Story = {
  parameters: {
    msw: getAccountEntryMocks({
      accounts: [
        {
          ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
          visibility: 'workspace',
          userWorkspaceId: 'another-owner',
          calendarChannels: [],
        },
      ],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(
        'This shared account is managed by its owner or a workspace administrator.',
      ),
    ).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Emails' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      canvas.queryByRole('link', { name: 'Calendar' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('switch', { name: 'Exclude group emails' }),
    ).not.toBeInTheDocument();
    await expect(messageFolderQueries).not.toHaveBeenCalled();
    await userEvent.click(
      canvas.getByRole('link', { name: 'Gmail preferences' }),
    );
    await expect(
      await canvas.findByText(
        'This shared account is managed by its owner or a workspace administrator.',
      ),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('switch', { name: 'Exclude group emails' }),
    ).not.toBeInTheDocument();
    await expect(messageChannelUpdates).not.toHaveBeenCalled();
  },
};

export const SharedNativeMessagingWorkspaceAdministratorCanEdit: Story = {
  beforeEach: () =>
    prepareAppPreferencesStory({
      permissionFlags: [
        PermissionFlagType.CONNECTED_ACCOUNTS,
        PermissionFlagType.WORKSPACE,
      ],
    }),
  parameters: {
    msw: getAccountEntryMocks({
      accounts: [
        {
          ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
          visibility: 'workspace',
          userWorkspaceId: 'another-owner',
          calendarChannels: [],
        },
      ],
      permissionFlags: [
        PermissionFlagType.CONNECTED_ACCOUNTS,
        PermissionFlagType.WORKSPACE,
      ],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('switch', { name: 'Exclude group emails' }),
    );
    await waitFor(() =>
      expect(messageChannelUpdates).toHaveBeenLastCalledWith({
        id: 'google-email-channel',
        update: { excludeGroupEmails: true },
      }),
    );
  },
};

export const SharedCalendarReadsOnlyRequestedConnectionAndIsReadOnly: Story = {
  parameters: {
    msw: getAccountEntryMocks({ accounts: [SHARED_NATIVE_CALENDAR_ACCOUNT] }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole('link', { name: 'Calendar' }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(
      canvas.getByText(
        'Calendar preferences for this shared account are managed by its owner.',
      ),
    ).toBeVisible();
    await expect(calendarChannelQueries).toHaveBeenCalledWith(
      MOCKED_GOOGLE_CONNECTED_ACCOUNT.id,
    );
    await expect(canvas.queryByRole('radio')).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('switch', { name: 'Auto-creation' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText('No apps are using this account.'),
    ).not.toBeInTheDocument();
    await expect(calendarChannelUpdates).not.toHaveBeenCalled();
  },
};

export const SharedCalendarIsReadOnlyForWorkspaceAdministrator: Story = {
  beforeEach: () =>
    prepareAppPreferencesStory({
      permissionFlags: [
        PermissionFlagType.CONNECTED_ACCOUNTS,
        PermissionFlagType.WORKSPACE,
      ],
    }),
  parameters: {
    msw: getAccountEntryMocks({
      accounts: [SHARED_NATIVE_CALENDAR_ACCOUNT],
      permissionFlags: [
        PermissionFlagType.CONNECTED_ACCOUNTS,
        PermissionFlagType.WORKSPACE,
      ],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(
        'Calendar preferences for this shared account are managed by its owner.',
      ),
    ).toBeVisible();
    await expect(calendarChannelQueries).toHaveBeenCalledWith(
      MOCKED_GOOGLE_CONNECTED_ACCOUNT.id,
    );
    await expect(canvas.queryByRole('radio')).not.toBeInTheDocument();
    await expect(calendarChannelUpdates).not.toHaveBeenCalled();
    await expect(
      canvas.getByRole('link', { name: 'Google Calendar preferences' }),
    ).toHaveAttribute(
      'href',
      '/settings/app-preferences/built-in/google-calendar?connectedAccountId=google-connected-account#general',
    );
  },
};

export const SharedCalendarReadErrorRetainsRetryBeforeBindingDiscovery: Story =
  {
    parameters: {
      msw: getAccountEntryMocks({
        accounts: [SHARED_NATIVE_CALENDAR_ACCOUNT],
        failFirstCalendarRead: true,
      }),
    },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      await expect(
        await canvas.findByText('Unable to load account preferences.'),
      ).toBeVisible();
      await expect(
        canvas.queryByText('No apps are using this account.'),
      ).not.toBeInTheDocument();
      await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
      await expect(
        await canvas.findByText(
          'Calendar preferences for this shared account are managed by its owner.',
        ),
      ).toBeVisible();
      await expect(nativeCalendarReads).toHaveBeenLastCalledWith({
        connectedAccountId: MOCKED_GOOGLE_CONNECTED_ACCOUNT.id,
      });
      await expect(calendarChannelUpdates).not.toHaveBeenCalled();
    },
  };

export const DisabledFeatureReturnsToLegacyAccounts: Story = {
  beforeEach: () =>
    prepareAppPreferencesStory({ isAppPreferencesEnabled: false }),
  parameters: {
    msw: {
      ...getAccountEntryMocks(),
      handlers: getAppPreferencesMocks({
        accounts: [MOCKED_GOOGLE_CONNECTED_ACCOUNT],
        isAppPreferencesEnabled: false,
      }).handlers,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Legacy accounts page')).toBeVisible();
    await expect(canvas.queryByText('Import')).not.toBeInTheDocument();
    await expect(messageFolderQueries).not.toHaveBeenCalled();
  },
};

export const NoAccountsPermissionCannotEnterAccountRoute: Story = {
  beforeEach: () => prepareAppPreferencesStory({ permissionFlags: [] }),
  parameters: { msw: getAccountEntryMocks({ permissionFlags: [] }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('Personal profile page'),
    ).toBeVisible();
    await expect(canvas.queryByText('Import')).not.toBeInTheDocument();
    await expect(readConnectedAccounts).not.toHaveBeenCalled();
    await expect(messageFolderQueries).not.toHaveBeenCalled();
  },
};
