import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { mockedDropdownConnectedAccount } from '@/settings/accounts/components/__stories__/mockedDropdownConnectedAccount';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { Text } from 'twenty-ui/primitives/typography';
import { ComponentDecorator } from 'twenty-ui/testing';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const onRowClick = fn();

const CurrentLocation = () => {
  const location = useLocation();

  return (
    <Text role="status" aria-label="Current location">
      {location.pathname}
    </Text>
  );
};

const meta: Meta<typeof SettingsAccountsRowDropdownMenu> = {
  title: 'Modules/Settings/Accounts/SettingsAccountsRowDropdownMenu',
  component: SettingsAccountsRowDropdownMenu,
  args: { account: mockedDropdownConnectedAccount },
  decorators: [
    ComponentDecorator,
    (Story) => (
      <MemoryRouter
        basename="/workspace"
        initialEntries={['/workspace/settings/accounts']}
      >
        <CurrentLocation />
        <TableRow onClick={onRowClick}>
          <Story />
        </TableRow>
      </MemoryRouter>
    ),
  ],
  beforeEach: () => {
    onRowClick.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsRowDropdownMenu>;

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'More options' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');

    const completeSetup = await canvas.findByRole('menuitem', {
      name: 'Complete setup',
    });
    await waitFor(() => expect(completeSetup).toHaveFocus());

    for (const { label, destination } of [
      {
        label: 'Complete setup',
        destination: 'configuration/connected-account',
      },
      {
        label: 'Connection settings',
        destination: 'edit-imap-smtp-caldav-connection/connected-account',
      },
      { label: 'Emails settings', destination: 'emails' },
      { label: 'Calendar settings', destination: 'calendars' },
    ]) {
      const item = canvas.getByRole('menuitem', { name: label });
      await expect(item.tagName).toBe('A');
      await expect(item).toHaveAttribute(
        'href',
        `/workspace/settings/accounts/${destination}`,
      );
    }

    await userEvent.keyboard('{Enter}');

    await expect(
      canvas.getByRole('status', { name: 'Current location' }),
    ).toHaveTextContent('/settings/accounts/configuration/connected-account');
    await expect(onRowClick).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};

export const DisconnectConfirmation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await userEvent.click(
      await canvas.findByRole('menuitem', { name: 'Disconnect account' }),
    );

    const dialog = await canvas.findByRole('dialog', {
      name: 'Disconnect account',
    });
    await expect(dialog).toHaveTextContent(
      'Your emails and events will be retained',
    );
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await expect(onRowClick).not.toHaveBeenCalled();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    );
    await waitFor(() =>
      expect(canvas.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const DeleteConfirmation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await userEvent.click(
      await canvas.findByRole('menuitem', {
        name: 'Delete account and synced data',
      }),
    );

    const dialog = await canvas.findByRole('dialog', {
      name: 'Delete account and synced data?',
    });
    await expect(dialog).toHaveTextContent(
      `This permanently deletes ${mockedDropdownConnectedAccount.handle}`,
    );
    await expect(
      within(dialog).getByRole('button', { name: 'Delete account and data' }),
    ).toBeVisible();
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await expect(onRowClick).not.toHaveBeenCalled();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    );
    await waitFor(() =>
      expect(canvas.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const ReconnectArchivedAccount: Story = {
  args: {
    account: {
      ...mockedDropdownConnectedAccount,
      provider: ConnectedAccountProvider.GOOGLE,
      archivedAt: '2026-09-23T00:00:00.000Z',
    },
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('generateTransientToken', () =>
          HttpResponse.json({
            data: {
              generateTransientToken: {
                transientToken: { token: 'reconnect-token' },
              },
            },
          }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const openWindow = spyOn(window, 'open').mockImplementation(() => null);

    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'More options' }),
      );
      const reconnect = await canvas.findByRole('menuitem', {
        name: 'Reconnect',
      });
      await expect(
        canvas.queryByRole('menuitem', { name: 'Disconnect account' }),
      ).not.toBeInTheDocument();
      await expect(
        canvas.getByRole('menuitem', {
          name: 'Delete account and synced data',
        }),
      ).toBeVisible();
      await userEvent.click(reconnect);

      await waitFor(() =>
        expect(openWindow).toHaveBeenCalledWith(
          `${REACT_APP_SERVER_BASE_URL}/auth/google-apis?transientToken=reconnect-token&redirectLocation=%2Fsettings%2Faccounts&loginHint=${mockedDropdownConnectedAccount.handle}`,
          '_self',
        ),
      );
      await waitFor(() =>
        expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
      );
      await expect(onRowClick).not.toHaveBeenCalled();
    } finally {
      openWindow.mockRestore();
    }
  },
};
