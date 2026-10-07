import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

import { SettingsAccounts } from '~/pages/settings/accounts/SettingsAccounts';
import {
  MOCKED_GOOGLE_CONNECTED_ACCOUNT,
  MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
  MOCKED_SETTINGS_CONNECTED_ACCOUNTS,
} from '~/pages/settings/accounts/__stories__/mockedConnectedAccounts';

const getAccountMocks = (
  accounts: ConnectedAccount[],
  isAppPreferencesEnabled?: boolean,
) => ({
  handlers: [
    graphql.query('GetCurrentUser', () =>
      HttpResponse.json({
        data: {
          currentUser: {
            ...mockedUserData,
            currentWorkspace: {
              ...mockCurrentWorkspace,
              featureFlags: isDefined(isAppPreferencesEnabled)
                ? [
                    {
                      key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
                      value: isAppPreferencesEnabled,
                    },
                  ]
                : [],
            },
          },
        },
      }),
    ),
    graphql.query('MyConnectedAccounts', () =>
      HttpResponse.json({
        data: {
          myConnectedAccounts: accounts.map((account) => ({
            ...account,
            authFailedReason: null,
          })),
        },
      }),
    ),
    graphql.query('MyMessageChannels', () =>
      HttpResponse.json({
        data: {
          myMessageChannels: accounts.flatMap(
            (account) => account.messageChannels,
          ),
        },
      }),
    ),
    graphql.query('MyCalendarChannels', () =>
      HttpResponse.json({
        data: {
          myCalendarChannels: accounts.flatMap(
            (account) => account.calendarChannels,
          ),
        },
      }),
    ),
    ...graphqlMocks.handlers,
  ],
});

const enableAppPreferences = () => {
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      { key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED, value: true },
    ],
  });
};

const getAccountRow = (canvasElement: HTMLElement, handle: string) => {
  const row = within(canvasElement)
    .getByText(handle)
    .closest<HTMLElement>('[data-table-row]');

  if (!isDefined(row)) {
    throw new Error(`Account row missing for ${handle}`);
  }

  return within(row);
};

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsAccounts',
  component: SettingsAccounts,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/accounts',
    additionalRoutes: [getSettingsPath(SettingsPath.NewAccount)],
  },
  parameters: {
    layout: 'fullscreen',
    msw: getAccountMocks([]),
  },
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);

    return () =>
      jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAccounts>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Connected accounts', undefined, {
      timeout: 3000,
    });
    await expect(canvas.getByText('Blocklist')).toBeVisible();
    await expect(canvas.queryByText('Used by')).not.toBeInTheDocument();
  },
};

export const FeatureFlagDisabled: Story = {
  parameters: {
    msw: getAccountMocks(MOCKED_SETTINGS_CONNECTED_ACCOUNTS, false),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(MOCKED_GOOGLE_CONNECTED_ACCOUNT.handle);
    await expect(canvas.getByText('Connected accounts')).toBeVisible();
    await expect(canvas.getByText('Status')).toBeVisible();
    await expect(canvas.queryByText('Used by')).not.toBeInTheDocument();
    await expect(canvas.getByText('Sync paused')).toBeVisible();
    await expect(canvas.getByText('Blocklist')).toBeVisible();
  },
};

export const AppPreferencesAccounts: Story = {
  beforeEach: enableAppPreferences,
  parameters: {
    msw: getAccountMocks(MOCKED_SETTINGS_CONNECTED_ACCOUNTS, true),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Used by');
    await canvas.findByText(MOCKED_GOOGLE_CONNECTED_ACCOUNT.handle);

    const googleAccount = getAccountRow(canvasElement, 'alex@example.com');
    await expect(
      googleAccount.getByRole('img', { name: 'Gmail' }),
    ).toBeVisible();
    await expect(
      googleAccount.getByRole('img', { name: 'Google Calendar' }),
    ).toBeVisible();

    const pausedAccount = getAccountRow(canvasElement, 'paused@example.com');
    await expect(pausedAccount.getByText('Sync paused')).toBeVisible();
    await expect(
      pausedAccount.getByRole('img', { name: 'Google Calendar' }),
    ).toBeVisible();
    await expect(
      pausedAccount.queryByRole('img', { name: 'Gmail' }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByText('Blocklist')).toBeVisible();

    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      pausedAccount.getByRole('button', { name: 'More options' }),
    );
    await expect(
      await body.findByRole('menuitem', { name: 'Reconnect' }),
    ).toBeVisible();
    await expect(
      body.queryByRole('menuitem', { name: 'Disconnect account' }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );

    const incompleteAccount = getAccountRow(
      canvasElement,
      'account@example.com',
    );
    await expect(incompleteAccount.getByText('Setup incomplete')).toBeVisible();
    await userEvent.click(
      incompleteAccount.getByRole('button', { name: 'More options' }),
    );
    await expect(
      await body.findByRole('menuitem', { name: 'Complete setup' }),
    ).toHaveAttribute(
      'href',
      getSettingsPath(SettingsPath.AccountsConfiguration, {
        connectedAccountId: 'connected-account',
      }),
    );
    await expect(
      body.getByRole('menuitem', { name: 'Connection settings' }),
    ).toHaveAttribute(
      'href',
      getSettingsPath(SettingsPath.EditImapSmtpCaldavConnection, {
        connectedAccountId: 'connected-account',
      }),
    );
    await expect(
      body.queryByRole('menuitem', { name: 'Emails settings' }),
    ).not.toBeInTheDocument();
    await expect(
      body.queryByRole('menuitem', { name: 'Calendar settings' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      body.getByRole('menuitem', { name: 'Disconnect account' }),
    );
    const disconnectDialog = await body.findByRole('dialog', {
      name: 'Disconnect account',
    });
    await expect(disconnectDialog).toHaveTextContent(
      'Your emails and events will be retained',
    );
    await userEvent.click(
      within(disconnectDialog).getByRole('button', { name: 'Cancel' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    await userEvent.click(
      incompleteAccount.getByRole('button', { name: 'More options' }),
    );
    await userEvent.click(
      await body.findByRole('menuitem', {
        name: 'Delete account and synced data',
      }),
    );
    const deleteDialog = await body.findByRole('dialog', {
      name: 'Delete account and synced data?',
    });
    await expect(deleteDialog).toHaveTextContent('account@example.com');
    await userEvent.click(
      within(deleteDialog).getByRole('button', { name: 'Cancel' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const AppPreferencesNoAccounts: Story = {
  beforeEach: enableAppPreferences,
  parameters: {
    msw: getAccountMocks([], true),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Connect with Google')).toBeVisible();
    await expect(canvas.getByText('Connect with Microsoft')).toBeVisible();
    await expect(canvas.getByText('Blocklist')).toBeVisible();
  },
};

export const AppPreferencesAddAccount: Story = {
  beforeEach: enableAppPreferences,
  parameters: {
    msw: getAccountMocks([MOCKED_GOOGLE_CONNECTED_ACCOUNT], true),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Add account' }),
    );
    await expect(
      await canvas.findByText('Navigated to /settings/accounts/new'),
    ).toBeVisible();
  },
};

export const AppPreferencesEmailOnly: Story = {
  beforeEach: enableAppPreferences,
  parameters: {
    msw: getAccountMocks(
      [{ ...MOCKED_GOOGLE_CONNECTED_ACCOUNT, calendarChannels: [] }],
      true,
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Used by');
    await expect(canvas.getByRole('img', { name: 'Gmail' })).toBeVisible();
    await expect(
      canvas.queryByRole('img', { name: 'Google Calendar' }),
    ).not.toBeInTheDocument();
  },
};

export const AppPreferencesCalendarOnly: Story = {
  beforeEach: enableAppPreferences,
  parameters: {
    msw: getAccountMocks([MOCKED_OUTLOOK_CALENDAR_ACCOUNT], true),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Used by');
    await expect(canvas.getByRole('img', { name: 'Outlook' })).toBeVisible();
    await expect(
      canvas.queryByRole('img', { name: 'Gmail' }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByText('Blocklist')).toBeVisible();
  },
};
