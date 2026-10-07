import { GOOGLE_CALENDAR_EVENTS_SCOPE } from '@/accounts/constants/GoogleCalendarEventsScope';
import { MICROSOFT_CALENDARS_READ_WRITE_SCOPE } from '@/accounts/constants/MicrosoftCalendarsReadWriteScope';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsAppPreferencesBuiltInApplication } from '~/pages/settings/app-preferences/SettingsAppPreferencesBuiltInApplication';
import {
  getAppPreferencesMocks,
  prepareAppPreferencesStory,
} from '~/pages/settings/app-preferences/__stories__/mockedAppPreferencesData';
import {
  MOCKED_GOOGLE_CONNECTED_ACCOUNT,
  MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
} from '~/pages/settings/accounts/__stories__/mockedConnectedAccounts';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

const meta: Meta<PageDecoratorArgs> = {
  title:
    'Pages/Settings/AppPreferences/SettingsAppPreferencesBuiltInApplication',
  component: SettingsAppPreferencesBuiltInApplication,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/app-preferences/built-in/:builtInAppId',
    routeParams: { ':builtInAppId': 'outlook' },
    additionalRoutes: [
      getSettingsPath(SettingsPath.AppPreferences),
      getSettingsPath(SettingsPath.NewImapSmtpCaldavConnection),
    ],
  },
  parameters: {
    layout: 'fullscreen',
    msw: getAppPreferencesMocks({
      accounts: [
        {
          ...MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
          scopes: [MICROSOFT_CALENDARS_READ_WRITE_SCOPE],
        },
      ],
    }),
  },
  beforeEach: () => prepareAppPreferencesStory(),
};

export default meta;
type Story = StoryObj<PageDecoratorArgs>;

export const CalendarOnlyOutlook: Story = {
  beforeEach: () =>
    prepareAppPreferencesStory({
      clientConfig: { isMicrosoftMessagingEnabled: false },
    }),
  parameters: {
    msw: getAppPreferencesMocks({
      accounts: [
        {
          ...MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
          scopes: [MICROSOFT_CALENDARS_READ_WRITE_SCOPE],
        },
        {
          ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
          handle: MOCKED_OUTLOOK_CALENDAR_ACCOUNT.handle,
        },
      ],
      clientConfig: { isMicrosoftMessagingEnabled: false },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Read calendar, Write calendar');
    await expect(
      canvas.getAllByText(MOCKED_OUTLOOK_CALENDAR_ACCOUNT.handle),
    ).toHaveLength(1);
    await expect(canvas.getByText('Permissions')).toBeVisible();
    await expect(
      canvas.queryByText(/Read emails|Write emails/),
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'General' })).toBeVisible();
    await expect(canvas.getByText('Blocklist')).toBeVisible();
    await expect(
      canvas.getByPlaceholderText('eddy@gmail.com, @apple.com'),
    ).toBeEnabled();
    await expect(
      canvas.getByRole('button', { name: 'Add to blocklist' }),
    ).toBeEnabled();

    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Disconnect account' }),
    );
    const dialog = await body.findByRole('dialog', {
      name: 'Disconnect account',
    });
    await expect(dialog).toHaveTextContent(
      'Your emails and events will be retained',
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    );
  },
};

export const GoogleCalendar: Story = {
  args: { routeParams: { ':builtInAppId': 'google-calendar' } },
  parameters: {
    msw: getAppPreferencesMocks({
      accounts: [
        {
          ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
          scopes: [GOOGLE_CALENDAR_EVENTS_SCOPE],
          messageChannels: [],
        },
      ],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Read calendar, Write calendar');
    await expect(canvas.getByText('Blocklist')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Add account' }),
    ).toBeEnabled();
  },
};

export const NoAccounts: Story = {
  parameters: { msw: getAppPreferencesMocks({ accounts: [] }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('No connected accounts'),
    ).toBeVisible();
    await expect(canvas.getByText('Blocklist')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Add account' }),
    ).toBeEnabled();
  },
};

export const AddImapAccount: Story = {
  beforeEach: () =>
    prepareAppPreferencesStory({
      clientConfig: { isImapSmtpCaldavEnabled: true },
    }),
  args: { routeParams: { ':builtInAppId': 'imap-smtp-caldav' } },
  parameters: {
    msw: getAppPreferencesMocks({
      accounts: [],
      clientConfig: { isImapSmtpCaldavEnabled: true },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('No connected accounts');
    await userEvent.click(canvas.getByRole('button', { name: 'Add account' }));
    await expect(
      await canvas.findByText(
        `Navigated to ${getSettingsPath(SettingsPath.NewImapSmtpCaldavConnection)}`,
      ),
    ).toBeVisible();
  },
};

export const UnknownApplication: Story = {
  args: { routeParams: { ':builtInAppId': 'unknown' } },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'Navigated to /settings/app-preferences',
      ),
    ).toBeVisible();
  },
};
