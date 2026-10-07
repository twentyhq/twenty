import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { SettingsAppPreferences } from '~/pages/settings/app-preferences/SettingsAppPreferences';
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
  title: 'Pages/Settings/AppPreferences/SettingsAppPreferences',
  component: SettingsAppPreferences,
  decorators: [PageDecorator],
  args: {
    routePath: getSettingsPath(SettingsPath.AppPreferences),
    additionalRoutes: ['gmail', 'google-calendar', 'outlook'].map(
      (builtInAppId) =>
        getSettingsPath(SettingsPath.AppPreferencesBuiltInApplication, {
          builtInAppId,
        }),
    ),
  },
  parameters: {
    layout: 'fullscreen',
    msw: getAppPreferencesMocks({
      accounts: [
        MOCKED_GOOGLE_CONNECTED_ACCOUNT,
        MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
      ],
    }),
  },
  beforeEach: () => prepareAppPreferencesStory(),
};

export default meta;
type Story = StoryObj<PageDecoratorArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(MOCKED_GOOGLE_CONNECTED_ACCOUNT.handle);
    await expect(canvas.getByText('Used by')).toBeVisible();
    await expect(canvas.getByText('Apps preferences')).toBeVisible();
    await expect(canvas.queryByText('Missing account')).not.toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Outlook' })).toHaveAttribute(
      'href',
      getSettingsPath(SettingsPath.AppPreferencesBuiltInApplication, {
        builtInAppId: 'outlook',
      }),
    );

    await userEvent.click(canvas.getByRole('link', { name: 'Gmail' }));
    await expect(
      await canvas.findByText(
        'Navigated to /settings/app-preferences/built-in/gmail',
      ),
    ).toBeVisible();
  },
};

export const EmailOnly: Story = {
  parameters: {
    msw: getAppPreferencesMocks({
      accounts: [{ ...MOCKED_GOOGLE_CONNECTED_ACCOUNT, calendarChannels: [] }],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const gmailRow = await canvas.findByRole('link', { name: 'Gmail' });
    const calendarRow = canvas.getByRole('link', { name: /Google Calendar/ });

    await canvas.findByText(MOCKED_GOOGLE_CONNECTED_ACCOUNT.handle);
    await expect(
      within(gmailRow).queryByText('Missing account'),
    ).not.toBeInTheDocument();
    await expect(
      within(calendarRow).getByText('Missing account'),
    ).toBeVisible();
  },
};

export const CalendarOnlyOutlook: Story = {
  beforeEach: () =>
    prepareAppPreferencesStory({
      clientConfig: {
        isGoogleMessagingEnabled: false,
        isGoogleCalendarEnabled: false,
        isMicrosoftMessagingEnabled: false,
      },
    }),
  parameters: {
    msw: getAppPreferencesMocks({
      accounts: [MOCKED_OUTLOOK_CALENDAR_ACCOUNT],
      clientConfig: {
        isGoogleMessagingEnabled: false,
        isGoogleCalendarEnabled: false,
        isMicrosoftMessagingEnabled: false,
      },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(MOCKED_OUTLOOK_CALENDAR_ACCOUNT.handle);
    await expect(canvas.getByRole('link', { name: 'Outlook' })).toBeVisible();
    await expect(
      canvas.queryByRole('link', { name: /Gmail|Google Calendar/ }),
    ).not.toBeInTheDocument();
    await expect(canvas.queryByText('Missing account')).not.toBeInTheDocument();
  },
};

export const NoAccounts: Story = {
  parameters: { msw: getAppPreferencesMocks({ accounts: [] }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Connect with Google');
    const rows = await canvas.findAllByText('Missing account');
    await expect(rows).toHaveLength(3);
    await userEvent.click(canvas.getByRole('link', { name: /Outlook/ }));
    await expect(
      await canvas.findByText(
        'Navigated to /settings/app-preferences/built-in/outlook',
      ),
    ).toBeVisible();
  },
};

export const MemberWithoutConnectedAccountsPermission: Story = {
  beforeEach: () => prepareAppPreferencesStory({ permissionFlags: [] }),
  parameters: {
    msw: getAppPreferencesMocks({
      accounts: [],
      canManageConnectedAccounts: false,
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Apps preferences')).toBeVisible();
    await expect(
      canvas.queryByText('Shared accounts between apps'),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('link', { name: /Gmail|Outlook|Google Calendar/ }),
    ).not.toBeInTheDocument();
    const appPreferencesNavigation = canvas
      .getAllByRole('link')
      .find((link) => link.textContent === 'App preferences');
    await expect(isDefined(appPreferencesNavigation)).toBe(true);
  },
};
