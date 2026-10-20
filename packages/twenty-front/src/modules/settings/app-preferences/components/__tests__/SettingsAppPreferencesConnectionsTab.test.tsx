import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAppPreferencesConnectionsTab } from '@/settings/app-preferences/components/SettingsAppPreferencesConnectionsTab';
import { useMyPersonalConnectedAccounts } from '@/settings/app-preferences/hooks/useMyPersonalConnectedAccounts';
import { ConnectionProviderScope } from '~/generated-metadata/graphql';

const mockTriggerAppOAuth = jest.fn();

jest.mock('@/settings/applications/hooks/useTriggerAppOAuth', () => ({
  useTriggerAppOAuth: jest.fn(() => ({
    triggerAppOAuth: mockTriggerAppOAuth,
  })),
}));

jest.mock(
  '@/settings/app-preferences/hooks/useMyPersonalConnectedAccounts',
  () => ({
    useMyPersonalConnectedAccounts: jest.fn(),
  }),
);

const mockedUseMyPersonalConnectedAccounts =
  useMyPersonalConnectedAccounts as jest.MockedFunction<
    typeof useMyPersonalConnectedAccounts
  >;

const APPLICATION_ID = 'application-1';
const PROVIDER_ID = 'provider-1';

const buildConnectionProvider = ({
  isClientCredentialsConfigured = true,
}: {
  isClientCredentialsConfigured?: boolean;
} = {}) => ({
  id: PROVIDER_ID,
  applicationId: APPLICATION_ID,
  type: 'oauth',
  name: 'linear',
  displayName: 'Linear',
  scope: ConnectionProviderScope.USER,
  logoUrl: null,
  oauth: { scopes: ['read'], isClientCredentialsConfigured },
});

const buildAccount = (
  overrides: Pick<ConnectedAccount, 'id' | 'handle'> &
    Partial<ConnectedAccount>,
): ConnectedAccount => ({
  provider: ConnectedAccountProvider.APP,
  authFailedAt: null,
  authFailedReason: null,
  archivedAt: null,
  scopes: null,
  handleAliases: null,
  lastSignedInAt: null,
  userWorkspaceId: 'user-workspace-1',
  connectionProviderId: PROVIDER_ID,
  applicationId: APPLICATION_ID,
  name: null,
  scope: 'USER',
  lastCredentialsRefreshedAt: null,
  connectionParameters: null,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  messageChannels: [],
  calendarChannels: [],
  __typename: 'ConnectedAccount',
  ...overrides,
});

const renderConnectionsTab = ({
  isClientCredentialsConfigured,
}: { isClientCredentialsConfigured?: boolean } = {}) =>
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <SettingsAppPreferencesConnectionsTab
          applicationId={APPLICATION_ID}
          connectionProviders={[
            buildConnectionProvider({ isClientCredentialsConfigured }),
          ]}
        />
      </MemoryRouter>
    </I18nProvider>,
  );

const REDIRECT_LOCATION = `/settings/accounts/applications/${APPLICATION_ID}#connections`;

describe('SettingsAppPreferencesConnectionsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts a personal connection that brings the member back to the Connections tab', async () => {
    mockedUseMyPersonalConnectedAccounts.mockReturnValue({
      accounts: [],
      loading: false,
    });

    renderConnectionsTab();

    expect(
      screen.getByText('You have no Linear connection yet.'),
    ).toBeVisible();

    await userEvent.click(
      screen.getByRole('button', { name: 'Add connection' }),
    );

    expect(mockTriggerAppOAuth).toHaveBeenCalledWith({
      applicationId: APPLICATION_ID,
      providerName: 'linear',
      scope: 'USER',
      redirectLocation: REDIRECT_LOCATION,
    });
  });

  it('reconnects the failed connection in place', async () => {
    mockedUseMyPersonalConnectedAccounts.mockReturnValue({
      accounts: [
        buildAccount({ id: 'account-ok', handle: 'ok@linear.app' }),
        buildAccount({
          id: 'account-failed',
          handle: 'failed@linear.app',
          authFailedAt: '2026-09-02T00:00:00.000Z',
        }),
        buildAccount({
          id: 'account-other-provider',
          handle: 'other@linear.app',
          connectionProviderId: 'provider-2',
        }),
      ],
      loading: false,
    });

    renderConnectionsTab();

    expect(screen.getByText('Connected')).toBeVisible();
    expect(screen.getByText('Reconnect needed')).toBeVisible();
    expect(screen.queryByText('other@linear.app')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Reconnect' }));

    expect(mockTriggerAppOAuth).toHaveBeenCalledWith({
      applicationId: APPLICATION_ID,
      providerName: 'linear',
      scope: 'USER',
      reconnectingConnectedAccountId: 'account-failed',
      redirectLocation: REDIRECT_LOCATION,
    });
  });

  it('asks for a reconnect of an archived connection', () => {
    mockedUseMyPersonalConnectedAccounts.mockReturnValue({
      accounts: [
        buildAccount({
          id: 'account-archived',
          handle: 'archived@linear.app',
          archivedAt: '2026-09-03T00:00:00.000Z',
        }),
      ],
      loading: false,
    });

    renderConnectionsTab();

    expect(screen.getByText('Reconnect needed')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Reconnect' })).toBeVisible();
  });

  it('offers neither adding nor reconnecting until the OAuth client is set up', () => {
    mockedUseMyPersonalConnectedAccounts.mockReturnValue({
      accounts: [
        buildAccount({
          id: 'account-failed',
          handle: 'failed@linear.app',
          authFailedAt: '2026-09-02T00:00:00.000Z',
        }),
      ],
      loading: false,
    });

    renderConnectionsTab({ isClientCredentialsConfigured: false });

    expect(
      screen.getByText(/not yet set up by your server administrator/),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Add connection' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Reconnect' }),
    ).not.toBeInTheDocument();
  });
});
