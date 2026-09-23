import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { MemoryRouter, useLocation } from 'react-router-dom';
import {
  CalendarChannelContactAutoCreationPolicy,
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { CalendarChannelVisibility } from '~/generated/graphql';

const triggerProviderReconnect = jest.fn();
const openDialog = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [jest.fn()],
  useApolloClient: () => ({ refetchQueries: jest.fn() }),
}));

jest.mock('@/settings/accounts/hooks/useTriggerProviderReconnect', () => ({
  useTriggerProviderReconnect: () => ({ triggerProviderReconnect }),
}));

jest.mock('@/ui/layout/dialog/hooks/useDialog', () => ({
  useDialog: () => ({ openDialog }),
}));

jest.mock('@/ui/layout/dialog/components/ConfirmationDialog', () => ({
  ConfirmationDialog: () => null,
}));

const account: ConnectedAccount = {
  id: 'connected-account',
  handle: 'account@example.com',
  provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  authFailedAt: null,
  archivedAt: null,
  scopes: null,
  handleAliases: null,
  lastSignedInAt: null,
  userWorkspaceId: 'user-workspace',
  connectionProviderId: null,
  name: null,
  visibility: 'user',
  lastCredentialsRefreshedAt: null,
  connectionParameters: null,
  createdAt: '2026-09-23T00:00:00.000Z',
  updatedAt: '2026-09-23T00:00:00.000Z',
  messageChannels: [],
  calendarChannels: [
    {
      id: 'calendar-channel',
      handle: 'account@example.com',
      visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
      isContactAutoCreationEnabled: false,
      contactAutoCreationPolicy: CalendarChannelContactAutoCreationPolicy.NONE,
      isSyncEnabled: true,
      syncStatus: CalendarChannelSyncStatus.NOT_SYNCED,
      syncStage: CalendarChannelSyncStage.PENDING_CONFIGURATION,
      syncStageStartedAt: null,
      connectedAccountId: 'connected-account',
      createdAt: '2026-09-23T00:00:00.000Z',
      updatedAt: '2026-09-23T00:00:00.000Z',
      __typename: 'CalendarChannel',
    },
  ],
  __typename: 'ConnectedAccount',
};

const CurrentLocation = () => {
  const location = useLocation();

  return <output aria-label="Current location">{location.pathname}</output>;
};

it('keeps workspace link destinations and navigates with the keyboard without activating the account row', async () => {
  const user = userEvent.setup();
  const onRowClick = jest.fn();

  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <MemoryRouter
          basename="/workspace"
          initialEntries={['/workspace/settings/accounts']}
        >
          <CurrentLocation />
          <TableRow onClick={onRowClick}>
            <SettingsAccountsRowDropdownMenu account={account} />
          </TableRow>
        </MemoryRouter>
      </Provider>
    </I18nProvider>,
  );

  screen.getByRole('button', { name: 'More options' }).focus();
  await user.keyboard('{ArrowDown}');

  const completeSetup = await screen.findByRole('menuitem', {
    name: 'Complete setup',
  });
  await waitFor(() => expect(completeSetup).toHaveFocus());

  for (const { label, destination } of [
    { label: 'Complete setup', destination: 'configuration/connected-account' },
    {
      label: 'Connection settings',
      destination: 'edit-imap-smtp-caldav-connection/connected-account',
    },
    { label: 'Emails settings', destination: 'emails' },
    { label: 'Calendar settings', destination: 'calendars' },
  ]) {
    const item = screen.getByRole('menuitem', { name: label });
    expect(item.tagName).toBe('A');
    expect(item).toHaveAttribute(
      'href',
      `/workspace/settings/accounts/${destination}`,
    );
  }

  await user.keyboard('{Enter}');

  expect(
    screen.getByRole('status', { name: 'Current location' }),
  ).toHaveTextContent('/settings/accounts/configuration/connected-account');
  expect(onRowClick).not.toHaveBeenCalled();
  await waitFor(() =>
    expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
  );
});

it.each([
  {
    label: 'Disconnect account',
    dialogId: 'disconnect-account-modal-connected-account',
  },
  {
    label: 'Delete account and synced data',
    dialogId: 'delete-account-modal-connected-account',
  },
])(
  'opens the separate $label confirmation and closes the menu',
  async ({ label, dialogId }) => {
    const user = userEvent.setup();
    openDialog.mockClear();

    render(
      <I18nProvider i18n={i18n}>
        <Provider store={createStore()}>
          <MemoryRouter>
            <SettingsAccountsRowDropdownMenu account={account} />
          </MemoryRouter>
        </Provider>
      </I18nProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'More options' }));
    await user.click(await screen.findByRole('menuitem', { name: label }));

    expect(openDialog).toHaveBeenCalledWith(dialogId);
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
);

it('reconnects an archived provider account with its login hint without offering to disconnect again', async () => {
  const user = userEvent.setup();

  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <MemoryRouter>
          <SettingsAccountsRowDropdownMenu
            account={{
              ...account,
              provider: ConnectedAccountProvider.GOOGLE,
              archivedAt: '2026-09-23T00:00:00.000Z',
            }}
          />
        </MemoryRouter>
      </Provider>
    </I18nProvider>,
  );

  await user.click(screen.getByRole('button', { name: 'More options' }));
  const reconnect = await screen.findByRole('menuitem', { name: 'Reconnect' });
  expect(
    screen.queryByRole('menuitem', { name: 'Disconnect account' }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('menuitem', { name: 'Delete account and synced data' }),
  ).toBeVisible();
  await user.click(reconnect);

  expect(triggerProviderReconnect).toHaveBeenCalledWith(
    ConnectedAccountProvider.GOOGLE,
    account.id,
    { loginHint: account.handle },
  );
  await waitFor(() =>
    expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
  );
});
