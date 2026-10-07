import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ReactNode } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  MessageChannelContactAutoCreationPolicy,
  MessageChannelSyncStage,
  MessageChannelType,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
} from '~/generated-metadata/graphql';
import { SettingsAccounts } from '~/pages/settings/accounts/SettingsAccounts';
import {
  MOCKED_GOOGLE_CONNECTED_ACCOUNT,
  MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
  MOCKED_PAUSED_GOOGLE_ACCOUNT,
} from '~/pages/settings/accounts/__stories__/mockedConnectedAccounts';
import { SettingsAppPreferencesBuiltInApplication } from '~/pages/settings/app-preferences/SettingsAppPreferencesBuiltInApplication';
import { SettingsAppPreferences } from '~/pages/settings/app-preferences/SettingsAppPreferences';
import {
  calendarChannelUpdates,
  getAppPreferencesChannelMocks,
  messageChannelUpdates,
  messageFolderQueries,
  messageFolderUpdates,
  MOCKED_SECOND_GOOGLE_ACCOUNT,
  MOCKED_SECOND_OUTLOOK_ACCOUNT,
} from '~/pages/settings/app-preferences/__stories__/mockedAppPreferencesChannels';
import {
  getAppPreferencesMocks,
  prepareAppPreferencesStory,
} from '~/pages/settings/app-preferences/__stories__/mockedAppPreferencesData';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

const messagingMocks = getAppPreferencesChannelMocks({
  accounts: [
    {
      ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
      messageChannels: [
        MOCKED_GOOGLE_CONNECTED_ACCOUNT.messageChannels[0],
        ...[
          {
            id: 'app-channel',
            handle: 'app@example.com',
            type: MessageChannelType.APP,
          },
          {
            id: 'group-channel',
            handle: 'group@example.com',
            type: MessageChannelType.EMAIL_GROUP,
          },
          {
            id: 'disabled-channel',
            handle: 'disabled@example.com',
            isSyncEnabled: false,
          },
          {
            id: 'pending-channel',
            handle: 'pending@example.com',
            syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
          },
        ].map((overrides) => ({
          ...MOCKED_GOOGLE_CONNECTED_ACCOUNT.messageChannels[0],
          ...overrides,
        })),
      ],
    },
    MOCKED_SECOND_GOOGLE_ACCOUNT,
    {
      ...MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
      handle: MOCKED_GOOGLE_CONNECTED_ACCOUNT.handle,
    },
  ],
});
const calendarMocks = getAppPreferencesChannelMocks({
  accounts: [
    MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
    MOCKED_SECOND_OUTLOOK_ACCOUNT,
    MOCKED_GOOGLE_CONNECTED_ACCOUNT,
  ],
  clientConfig: { isMicrosoftMessagingEnabled: false },
});
const googleCalendarMocks = getAppPreferencesChannelMocks({
  accounts: [
    MOCKED_GOOGLE_CONNECTED_ACCOUNT,
    MOCKED_SECOND_GOOGLE_ACCOUNT,
    MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
  ],
});

type ChannelsWithHistoryNavigationProps = { children?: ReactNode };

const ChannelsWithHistoryNavigation = ({
  children,
}: ChannelsWithHistoryNavigationProps) => {
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
      {children ?? <SettingsAppPreferencesBuiltInApplication />}
    </>
  );
};

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/AppPreferences/SettingsAppPreferencesChannels',
  component: SettingsAppPreferencesBuiltInApplication,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/app-preferences/built-in/:builtInAppId',
    routeParams: { ':builtInAppId': 'gmail' },
  },
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: messagingMocks.handlers },
  },
  beforeEach: async () => {
    messagingMocks.reset();
    calendarMocks.reset();
    googleCalendarMocks.reset();
    return prepareAppPreferencesStory();
  },
};

export default meta;
type Story = StoryObj<PageDecoratorArgs>;

export const MessagingAccountIsolation: Story = {
  beforeEach: () => {
    jotaiStore.set(settingsAccountsSelectedMessageChannelState.atom, {
      ...MOCKED_GOOGLE_CONNECTED_ACCOUNT.messageChannels[0],
      id: 'previous-account-message-channel',
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('link', { name: 'Messaging' }),
    );
    await canvas.findByText('Import');
    await expect(
      canvas.queryByRole('link', { name: 'Calendar' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('link', { name: 'Emails' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('link', { name: 'Calendars' }),
    ).not.toBeInTheDocument();
    const groupSwitch = canvas.getByRole('switch', {
      name: 'Exclude group emails',
    });
    await userEvent.click(groupSwitch);
    await waitFor(() =>
      expect(messageChannelUpdates).toHaveBeenLastCalledWith({
        id: 'google-email-channel',
        update: { excludeGroupEmails: true },
      }),
    );
    await expect(groupSwitch).toBeChecked();
    await userEvent.click(canvas.getByRole('radio', { name: 'Metadata' }));
    await waitFor(() =>
      expect(messageChannelUpdates).toHaveBeenLastCalledWith({
        id: 'google-email-channel',
        update: { visibility: MessageChannelVisibility.METADATA },
      }),
    );
    await userEvent.click(canvas.getByRole('radio', { name: 'Sent' }));
    await waitFor(() =>
      expect(messageChannelUpdates).toHaveBeenLastCalledWith({
        id: 'google-email-channel',
        update: {
          contactAutoCreationPolicy:
            MessageChannelContactAutoCreationPolicy.SENT,
        },
      }),
    );
    await userEvent.click(canvas.getByRole('radio', { name: 'Some folders' }));
    await waitFor(() =>
      expect(messageChannelUpdates).toHaveBeenLastCalledWith({
        id: 'google-email-channel',
        update: {
          messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
        },
      }),
    );
    const firstFolderRow = (
      await canvas.findByText('First Account Folder')
    ).closest('li');
    if (!isDefined(firstFolderRow)) {
      throw new Error('First account folder is missing');
    }
    await userEvent.click(within(firstFolderRow).getByRole('checkbox'));
    await waitFor(() =>
      expect(messageFolderUpdates).toHaveBeenLastCalledWith({
        ids: ['first-google-folder'],
        update: { isSynced: true },
      }),
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Account' }));
    for (const handle of [
      'app@example.com',
      'group@example.com',
      'disabled@example.com',
      'pending@example.com',
      MOCKED_OUTLOOK_CALENDAR_ACCOUNT.handle,
    ]) {
      await expect(
        body.queryByRole('button', { name: handle }),
      ).not.toBeInTheDocument();
    }
    await userEvent.click(
      await body.findByRole('button', {
        name: MOCKED_SECOND_GOOGLE_ACCOUNT.handle,
      }),
    );
    await expect(
      canvas.getByRole('switch', { name: 'Exclude group emails' }),
    ).not.toBeChecked();
    await expect(
      await canvas.findByText('Second Account Folder'),
    ).toBeVisible();
    await expect(
      canvas.queryByText('First Account Folder'),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('switch', { name: 'Exclude group emails' }),
    );
    await waitFor(() =>
      expect(messageChannelUpdates).toHaveBeenLastCalledWith({
        id: 'second-google-message-channel',
        update: { excludeGroupEmails: true },
      }),
    );
    const secondFolderRow = canvas
      .getByText('Second Account Folder')
      .closest('li');
    if (!isDefined(secondFolderRow)) {
      throw new Error('Second account folder is missing');
    }
    await userEvent.click(within(secondFolderRow).getByRole('checkbox'));
    await waitFor(() =>
      expect(messageFolderUpdates).toHaveBeenLastCalledWith({
        ids: ['second-google-folder'],
        update: { isSynced: true },
      }),
    );
    await expect(
      new Set(messageFolderQueries.mock.calls.map(([channelId]) => channelId)),
    ).toEqual(
      new Set(['google-email-channel', 'second-google-message-channel']),
    );
  },
};

export const CalendarAccountIsolation: Story = {
  args: { routeParams: { ':builtInAppId': 'outlook' } },
  beforeEach: () =>
    prepareAppPreferencesStory({
      clientConfig: { isMicrosoftMessagingEnabled: false },
    }),
  parameters: { msw: { handlers: calendarMocks.handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await expect(
      canvas.queryByRole('link', { name: 'Messaging' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      await canvas.findByRole('link', { name: 'Calendar' }),
    );
    await canvas.findByText('Event visibility');
    await userEvent.click(canvas.getByRole('radio', { name: 'Metadata' }));
    await waitFor(() =>
      expect(calendarChannelUpdates).toHaveBeenLastCalledWith({
        id: 'outlook-calendar-channel',
        update: { visibility: CalendarChannelVisibility.METADATA },
      }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Account' }));
    await expect(
      body.queryByRole('button', {
        name: MOCKED_GOOGLE_CONNECTED_ACCOUNT.handle,
      }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      await body.findByRole('button', {
        name: MOCKED_SECOND_OUTLOOK_ACCOUNT.handle,
      }),
    );
    await userEvent.click(
      canvas.getByRole('switch', { name: 'Auto-creation' }),
    );
    await waitFor(() =>
      expect(calendarChannelUpdates).toHaveBeenLastCalledWith({
        id: 'second-outlook-calendar-channel',
        update: { isContactAutoCreationEnabled: true },
      }),
    );
    await userEvent.click(canvas.getByRole('radio', { name: 'Metadata' }));
    await waitFor(() =>
      expect(calendarChannelUpdates).toHaveBeenLastCalledWith({
        id: 'second-outlook-calendar-channel',
        update: { visibility: CalendarChannelVisibility.METADATA },
      }),
    );
    await userEvent.click(canvas.getByRole('link', { name: 'General' }));
    await expect(await canvas.findByText('Blocklist')).toBeVisible();
  },
};

export const GoogleCalendarPreferences: Story = {
  args: { routeParams: { ':builtInAppId': 'google-calendar' } },
  parameters: { msw: { handlers: googleCalendarMocks.handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole('link', { name: 'Messaging' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      await canvas.findByRole('link', { name: 'Calendar' }),
    );
    await canvas.findByText('Event visibility');
    await userEvent.click(canvas.getByRole('radio', { name: 'Metadata' }));
    await waitFor(() =>
      expect(calendarChannelUpdates).toHaveBeenLastCalledWith({
        id: 'google-calendar-channel',
        update: { visibility: CalendarChannelVisibility.METADATA },
      }),
    );
    await expect(messageChannelUpdates).not.toHaveBeenCalled();
  },
};

export const AccountMenuAndBackNavigation: Story = {
  render: () => <ChannelsWithHistoryNavigation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const secondAccountRow = (
      await canvas.findByText(MOCKED_SECOND_GOOGLE_ACCOUNT.handle)
    ).closest<HTMLElement>('[data-table-row]');
    if (!isDefined(secondAccountRow)) {
      throw new Error('Second connected account is missing');
    }
    await userEvent.click(
      within(secondAccountRow).getByRole('button', { name: 'More options' }),
    );
    const messagingMenuItem = await body.findByRole('menuitem', {
      name: 'Emails settings',
    });
    await expect(messagingMenuItem).toHaveAttribute(
      'href',
      '/settings/app-preferences/built-in/gmail?connectedAccountId=second-google-account#messaging',
    );
    await expect(
      body.getByRole('menuitem', { name: 'Calendar settings' }),
    ).toHaveAttribute(
      'href',
      '/settings/app-preferences/built-in/google-calendar?connectedAccountId=second-google-account#calendar',
    );
    await userEvent.click(messagingMenuItem);
    await expect(
      await canvas.findByText('Second Account Folder'),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('switch', { name: 'Exclude group emails' }),
    );
    await waitFor(() =>
      expect(messageChannelUpdates).toHaveBeenLastCalledWith({
        id: 'second-google-message-channel',
        update: { excludeGroupEmails: true },
      }),
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Account' }));
    await userEvent.click(
      await body.findByRole('button', {
        name: MOCKED_GOOGLE_CONNECTED_ACCOUNT.handle,
      }),
    );
    await expect(
      canvas.getByRole('status', { name: 'Current preferences URL' }),
    ).toHaveTextContent(
      '/settings/app-preferences/built-in/gmail?connectedAccountId=google-connected-account#messaging',
    );
    await userEvent.click(
      canvas.getByRole('switch', { name: 'Exclude group emails' }),
    );
    await waitFor(() =>
      expect(messageChannelUpdates).toHaveBeenLastCalledWith({
        id: 'google-email-channel',
        update: { excludeGroupEmails: true },
      }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
    await expect(
      await canvas.findByText('Second Account Folder'),
    ).toBeVisible();
    await expect(
      canvas.getByRole('status', { name: 'Current preferences URL' }),
    ).toHaveTextContent(
      '/settings/app-preferences/built-in/gmail?connectedAccountId=second-google-account#messaging',
    );
    await userEvent.click(
      canvas.getByRole('switch', { name: 'Exclude group emails' }),
    );
    await waitFor(() =>
      expect(messageChannelUpdates).toHaveBeenLastCalledWith({
        id: 'second-google-message-channel',
        update: { excludeGroupEmails: false },
      }),
    );
    await expect(
      messageFolderQueries.mock.calls.every(
        ([channelId]) => channelId === 'second-google-message-channel',
      ),
    ).toBe(true);
  },
};

export const BareUrlTabHistoryAndRevisit: Story = {
  args: { routePath: '/settings/*' },
  render: () => (
    <ChannelsWithHistoryNavigation>
      <Routes>
        <Route path="app-preferences" element={<SettingsAppPreferences />} />
        <Route
          path="app-preferences/built-in/:builtInAppId"
          element={<SettingsAppPreferencesBuiltInApplication />}
        />
        <Route
          path="*"
          element={
            <Navigate to="/settings/app-preferences/built-in/gmail" replace />
          }
        />
      </Routes>
    </ChannelsWithHistoryNavigation>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const preferencesUrl = await canvas.findByRole('status', {
      name: 'Current preferences URL',
    });

    await expect(await canvas.findByText('Blocklist')).toBeVisible();
    await expect(preferencesUrl).toHaveTextContent(
      /^\/settings\/app-preferences\/built-in\/gmail$/,
    );
    await expect(canvas.getByRole('link', { name: 'General' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await userEvent.click(canvas.getByRole('link', { name: 'Messaging' }));
    await expect(await canvas.findByText('Import')).toBeVisible();
    await expect(
      canvas.getByRole('link', { name: 'Messaging' }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(canvas.queryByText('Blocklist')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
    await expect(await canvas.findByText('Blocklist')).toBeVisible();
    await expect(preferencesUrl).toHaveTextContent(
      /^\/settings\/app-preferences\/built-in\/gmail$/,
    );
    await expect(canvas.getByRole('link', { name: 'General' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      canvas.getByRole('link', { name: 'Messaging' }),
    ).not.toHaveAttribute('aria-current');
    await expect(canvas.queryByText('Import')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Forward' }));
    await expect(await canvas.findByText('Import')).toBeVisible();
    await expect(preferencesUrl).toHaveTextContent(
      '/settings/app-preferences/built-in/gmail#messaging',
    );
    await expect(
      canvas.getByRole('link', { name: 'Messaging' }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(
      canvas.getByRole('link', { name: 'General' }),
    ).not.toHaveAttribute('aria-current');

    await userEvent.click(canvas.getByRole('link', { name: 'Apps' }));
    await canvas.findByText('Apps preferences');
    await userEvent.click(canvas.getByRole('link', { name: 'Gmail' }));
    await expect(await canvas.findByText('Blocklist')).toBeVisible();
    await expect(preferencesUrl).toHaveTextContent(
      /^\/settings\/app-preferences\/built-in\/gmail$/,
    );
    await expect(canvas.getByRole('link', { name: 'General' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvas.queryByText('Import')).not.toBeInTheDocument();
  },
};

export const RequestedUnavailableAccount: Story = {
  args: {
    searchParams: { connectedAccountId: MOCKED_PAUSED_GOOGLE_ACCOUNT.id },
  },
  parameters: {
    msw: getAppPreferencesMocks({
      accounts: [MOCKED_GOOGLE_CONNECTED_ACCOUNT, MOCKED_PAUSED_GOOGLE_ACCOUNT],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('link', { name: 'Messaging' }),
    );
    await expect(
      await canvas.findByText(
        'Connect an email account in General to configure messaging preferences.',
      ),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('switch', { name: 'Exclude group emails' }),
    ).not.toBeInTheDocument();
    await expect(messageChannelUpdates).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('link', { name: 'Go to General' }));
    await expect(
      await canvas.findByText(MOCKED_PAUSED_GOOGLE_ACCOUNT.handle),
    ).toBeVisible();
    await expect(canvas.getByText('Blocklist')).toBeVisible();
  },
};

export const UnsupportedCalendarMenu: Story = {
  beforeEach: () =>
    prepareAppPreferencesStory({
      clientConfig: { isGoogleCalendarEnabled: false },
    }),
  parameters: {
    msw: getAppPreferencesMocks({
      accounts: [MOCKED_GOOGLE_CONNECTED_ACCOUNT],
      clientConfig: { isGoogleCalendarEnabled: false },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await canvas.findByText(MOCKED_GOOGLE_CONNECTED_ACCOUNT.handle);
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await expect(
      await body.findByRole('menuitem', { name: 'Emails settings' }),
    ).toHaveAttribute(
      'href',
      '/settings/app-preferences/built-in/gmail?connectedAccountId=google-connected-account#messaging',
    );
    await expect(
      body.queryByRole('menuitem', { name: 'Calendar settings' }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};

export const MessagingWithoutAccount: Story = {
  parameters: { msw: getAppPreferencesMocks({ accounts: [] }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('link', { name: 'Messaging' }),
    );
    await expect(
      await canvas.findByText(
        'Connect an email account in General to configure messaging preferences.',
      ),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('switch', { name: 'Exclude group emails' }),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('link', { name: 'Go to General' }));
    await expect(await canvas.findByText('Blocklist')).toBeVisible();
    await expect(messageChannelUpdates).not.toHaveBeenCalled();
  },
};

export const CalendarWithoutAccount: Story = {
  args: { routeParams: { ':builtInAppId': 'google-calendar' } },
  parameters: { msw: getAppPreferencesMocks({ accounts: [] }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('link', { name: 'Calendar' }),
    );
    await expect(
      await canvas.findByText(
        'Connect a calendar account in General to configure calendar preferences.',
      ),
    ).toBeVisible();
    await expect(canvas.queryByRole('radio')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('link', { name: 'Go to General' }));
    await expect(await canvas.findByText('Blocklist')).toBeVisible();
    await expect(calendarChannelUpdates).not.toHaveBeenCalled();
  },
};

export const FeatureFlagOffNavigation: Story = {
  render: () => <SettingsAccounts />,
  args: { routePath: '/settings/accounts' },
  beforeEach: () =>
    prepareAppPreferencesStory({ isAppPreferencesEnabled: false }),
  parameters: {
    msw: getAppPreferencesMocks({
      accounts: [MOCKED_GOOGLE_CONNECTED_ACCOUNT],
      isAppPreferencesEnabled: false,
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Connected accounts');
    await expect(canvas.getByRole('link', { name: 'Emails' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Calendars' })).toBeVisible();
    await expect(
      canvas.queryByRole('link', { name: 'App preferences' }),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await expect(
      await body.findByRole('menuitem', { name: 'Emails settings' }),
    ).toHaveAttribute('href', '/settings/accounts/emails');
    await expect(
      body.getByRole('menuitem', { name: 'Calendar settings' }),
    ).toHaveAttribute('href', '/settings/accounts/calendars');
    await userEvent.keyboard('{Escape}');
  },
};
