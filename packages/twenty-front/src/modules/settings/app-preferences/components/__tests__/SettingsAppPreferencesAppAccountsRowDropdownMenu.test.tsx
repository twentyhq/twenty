import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAppPreferencesAppAccountsRowDropdownMenu } from '@/settings/app-preferences/components/SettingsAppPreferencesAppAccountsRowDropdownMenu';

const mockOpenDialog = jest.fn();
const mockTriggerAppOAuth = jest.fn();
const mockApplications = [
  { id: 'linear-app', name: 'Linear' },
  { id: 'fathom-app', name: 'Fathom' },
];
let mockOAuthConfigured = true;

jest.mock('@/auth/states/currentWorkspaceState', () => ({
  currentWorkspaceState: {},
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({ installedApplications: mockApplications }),
}));
jest.mock(
  '@/settings/app-preferences/hooks/useApplicationsWithPreferences',
  () => ({
    useApplicationsWithPreferences: () => ({
      applicationsWithPreferences: mockApplications.map((application) => ({
        connectionProviders: [
          {
            id: `${application.id}-provider`,
            name: application.name.toLowerCase(),
            oauth: { isClientCredentialsConfigured: mockOAuthConfigured },
          },
        ],
      })),
    }),
  }),
);
jest.mock('@/settings/applications/hooks/useTriggerAppOAuth', () => ({
  useTriggerAppOAuth: () => ({ triggerAppOAuth: mockTriggerAppOAuth }),
}));
jest.mock('@/ui/layout/dialog/hooks/useDialog', () => ({
  useDialog: () => ({ openDialog: mockOpenDialog }),
}));
jest.mock(
  '@/settings/app-preferences/components/SettingsAppPreferencesDisconnectConnectionDialog',
  () => ({
    SettingsAppPreferencesDisconnectConnectionDialog: () => null,
  }),
);
jest.mock('@/ui/layout/dropdown/components/DropdownRoot', () => ({
  DropdownRoot: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('@/ui/layout/dropdown/components/DropdownContent', () => ({
  DropdownContent: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('twenty-ui/components/navigation', () => ({
  Dropdown: {
    Trigger: () => null,
    Section: ({ children }: { children: ReactNode }) => children,
    ActionItem: ({
      children,
      onClick,
    }: {
      children: ReactNode;
      onClick: () => void;
    }) => (
      <button role="menuitem" onClick={onClick}>
        {children}
      </button>
    ),
  },
}));

const buildAccount = (
  overrides: Partial<ConnectedAccount> = {},
): ConnectedAccount => ({
  __typename: 'ConnectedAccount',
  id: 'linear-1',
  name: 'Linear #1',
  handle: 'member@example.com',
  provider: ConnectedAccountProvider.APP,
  applicationId: 'linear-app',
  connectionProviderId: 'linear-app-provider',
  userWorkspaceId: 'member-1',
  scope: 'USER',
  authFailedAt: null,
  authFailedReason: null,
  archivedAt: null,
  scopes: null,
  handleAliases: null,
  lastSignedInAt: null,
  lastCredentialsRefreshedAt: null,
  connectionParameters: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  messageChannels: [],
  calendarChannels: [],
  ...overrides,
});

const renderMenu = (appAccounts: ConnectedAccount[]) =>
  render(
    <I18nProvider i18n={i18n}>
      <SettingsAppPreferencesAppAccountsRowDropdownMenu
        groupId="member@example.com"
        appAccounts={appAccounts}
      />
    </I18nProvider>,
  );

describe('SettingsAppPreferencesAppAccountsRowDropdownMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOAuthConfigured = true;
  });

  it('distinguishes connections to the same app and targets the selected connection', async () => {
    renderMenu([
      buildAccount({ authFailedAt: '2026-01-02T00:00:00.000Z' }),
      buildAccount({
        id: 'linear-2',
        name: 'Linear #2',
        archivedAt: '2026-01-02T00:00:00.000Z',
      }),
    ]);

    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Disconnect Linear (Linear #2)' }),
    );
    expect(mockOpenDialog).toHaveBeenCalledWith(
      'disconnect-app-account-modal-linear-2',
    );

    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Reconnect Linear (Linear #1)' }),
    );
    expect(mockTriggerAppOAuth).toHaveBeenCalledWith({
      applicationId: 'linear-app',
      providerName: 'linear',
      scope: 'USER',
      reconnectingConnectedAccountId: 'linear-1',
      redirectLocation:
        '/settings/accounts/applications/linear-app#connections',
    });
    expect(
      screen.getByRole('menuitem', { name: 'Reconnect Linear (Linear #2)' }),
    ).toBeVisible();
  });

  it('keeps application labels when each app has one connection', async () => {
    renderMenu([
      buildAccount(),
      buildAccount({
        id: 'fathom-1',
        name: 'Fathom #1',
        applicationId: 'fathom-app',
        connectionProviderId: 'fathom-app-provider',
      }),
    ]);

    expect(
      screen.getByRole('menuitem', { name: 'Disconnect Linear' }),
    ).toBeVisible();
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Disconnect Fathom' }),
    );
    expect(mockOpenDialog).toHaveBeenCalledWith(
      'disconnect-app-account-modal-fathom-1',
    );
  });

  it('keeps the single healthy connection action simple', () => {
    renderMenu([buildAccount()]);

    expect(screen.getByRole('menuitem', { name: 'Disconnect' })).toBeVisible();
    expect(
      screen.queryByRole('menuitem', { name: /Reconnect/ }),
    ).not.toBeInTheDocument();
  });

  it('keeps disconnect available when an archived connection has no OAuth setup', () => {
    mockOAuthConfigured = false;
    renderMenu([buildAccount({ archivedAt: '2026-01-02T00:00:00.000Z' })]);

    expect(screen.getByRole('menuitem', { name: 'Disconnect' })).toBeVisible();
    expect(
      screen.queryByRole('menuitem', { name: /Reconnect/ }),
    ).not.toBeInTheDocument();
  });
});
