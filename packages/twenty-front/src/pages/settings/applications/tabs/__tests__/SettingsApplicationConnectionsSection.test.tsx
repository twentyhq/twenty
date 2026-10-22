import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { ConnectedAccountScope } from '~/generated-metadata/graphql';
import { SettingsApplicationConnectionsSection } from '~/pages/settings/applications/tabs/SettingsApplicationConnectionsSection';
import { useFindApplicationConnectionProviders } from '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders';
import { useApplicationConnectedAccounts } from '~/pages/settings/applications/hooks/useApplicationConnectedAccounts';

const mockTriggerAppOAuth = jest.fn();

jest.mock(
  '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders',
  () => ({
    useFindApplicationConnectionProviders: jest.fn(),
  }),
);

jest.mock(
  '~/pages/settings/applications/hooks/useApplicationConnectedAccounts',
  () => ({
    useApplicationConnectedAccounts: jest.fn(),
  }),
);

jest.mock('@/settings/applications/hooks/useTriggerAppOAuth', () => ({
  useTriggerAppOAuth: jest.fn(() => ({
    triggerAppOAuth: mockTriggerAppOAuth,
  })),
}));

const mockedUseFindApplicationConnectionProviders =
  useFindApplicationConnectionProviders as jest.MockedFunction<
    typeof useFindApplicationConnectionProviders
  >;

const mockedUseApplicationConnectedAccounts =
  useApplicationConnectedAccounts as jest.MockedFunction<
    typeof useApplicationConnectedAccounts
  >;

describe('SettingsApplicationConnectionsSection', () => {
  const CONNECTION_SCOPES = [
    ConnectedAccountScope.USER,
    ConnectedAccountScope.WORKSPACE,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(CONNECTION_SCOPES)('links %s rows for WORKSPACE', (scope) => {
    mockedUseFindApplicationConnectionProviders.mockReturnValue({
      connectionProviders: [
        {
          id: 'provider-1',
          applicationId: 'app-1',
          type: 'oauth',
          name: 'google-calendar',
          displayName: 'Google Calendar',
          scope: 'WORKSPACE',
          logoUrl: null,
          oauth: {
            scopes: ['calendar.readonly'],
            isClientCredentialsConfigured: false,
          },
        },
      ],
      loading: false,
      refetch: jest.fn(),
    });

    mockedUseApplicationConnectedAccounts.mockReturnValue({
      accounts: [
        {
          __typename: 'ApplicationConnectedAccountDTO',
          id: 'account-1',
          handle: 'workspace@example.com',
          authFailedAt: '2026-05-01T00:00:00.000Z',
          scopes: ['calendar.readonly'],
          lastSignedInAt: null,
          connectionProviderId: 'provider-1',
          name: 'Main connection',
          scope,
          lastCredentialsRefreshedAt: null,
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-01T00:00:00.000Z',
        },
      ],
      loading: false,
      refetch: jest.fn(),
    });

    render(
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <SettingsApplicationConnectionsSection applicationId="app-1" />
        </MemoryRouter>
      </I18nProvider>,
    );

    expect(
      screen.getByRole('link', { name: /Main connection/i }),
    ).toHaveAttribute(
      'href',
      '/settings/applications/app-1/connections/account-1',
    );
    expect(screen.getByText('Reconnect needed')).toBeVisible();
    expect(
      screen.getByText(
        scope === ConnectedAccountScope.WORKSPACE
          ? 'Workspace shared'
          : 'Just for me',
      ),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Reconnect' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
  });

  it('adds a workspace shared connection', async () => {
    mockedUseFindApplicationConnectionProviders.mockReturnValue({
      connectionProviders: [
        {
          id: 'provider-1',
          applicationId: 'app-1',
          type: 'oauth',
          name: 'google-calendar',
          displayName: 'Google Calendar',
          scope: 'WORKSPACE',
          logoUrl: null,
          oauth: {
            scopes: ['calendar.readonly'],
            isClientCredentialsConfigured: true,
          },
        },
      ],
      loading: false,
      refetch: jest.fn(),
    });

    mockedUseApplicationConnectedAccounts.mockReturnValue({
      accounts: [],
      loading: false,
      refetch: jest.fn(),
    });

    render(
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <SettingsApplicationConnectionsSection applicationId="app-1" />
        </MemoryRouter>
      </I18nProvider>,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /Add connection/i }),
    );

    expect(mockTriggerAppOAuth).toHaveBeenCalledTimes(1);
    expect(mockTriggerAppOAuth).toHaveBeenCalledWith({
      applicationId: 'app-1',
      providerName: 'google-calendar',
    });
  });

  it('hides a provider scoped to each member when the caller sees none of its connections', () => {
    mockedUseFindApplicationConnectionProviders.mockReturnValue({
      connectionProviders: [
        {
          id: 'provider-1',
          applicationId: 'app-1',
          type: 'oauth',
          name: 'google-calendar',
          displayName: 'Google Calendar',
          scope: 'USER',
          logoUrl: null,
          oauth: {
            scopes: ['calendar.readonly'],
            isClientCredentialsConfigured: false,
          },
        },
      ],
      loading: false,
      refetch: jest.fn(),
    });

    mockedUseApplicationConnectedAccounts.mockReturnValue({
      accounts: [],
      loading: false,
      refetch: jest.fn(),
    });

    render(
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <SettingsApplicationConnectionsSection applicationId="app-1" />
        </MemoryRouter>
      </I18nProvider>,
    );

    expect(screen.queryByText('Google Calendar')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Add connection/i }),
    ).not.toBeInTheDocument();
  });

  it.each(CONNECTION_SCOPES)('lists %s rows for USER providers', (scope) => {
    mockedUseFindApplicationConnectionProviders.mockReturnValue({
      connectionProviders: [
        {
          id: 'provider-1',
          applicationId: 'app-1',
          type: 'oauth',
          name: 'google-calendar',
          displayName: 'Google Calendar',
          scope: 'USER',
          logoUrl: null,
          oauth: {
            scopes: ['calendar.readonly'],
            isClientCredentialsConfigured: false,
          },
        },
      ],
      loading: false,
      refetch: jest.fn(),
    });

    mockedUseApplicationConnectedAccounts.mockReturnValue({
      accounts: [
        {
          __typename: 'ApplicationConnectedAccountDTO',
          id: 'account-1',
          handle: 'me@example.com',
          authFailedAt: null,
          scopes: ['calendar.readonly'],
          lastSignedInAt: null,
          connectionProviderId: 'provider-1',
          name: 'My calendar',
          scope,
          lastCredentialsRefreshedAt: null,
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-01T00:00:00.000Z',
        },
      ],
      loading: false,
      refetch: jest.fn(),
    });

    render(
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <SettingsApplicationConnectionsSection applicationId="app-1" />
        </MemoryRouter>
      </I18nProvider>,
    );

    expect(screen.getByRole('link', { name: /My calendar/i })).toHaveAttribute(
      'href',
      '/settings/applications/app-1/connections/account-1',
    );
    expect(
      screen.getByText(
        scope === ConnectedAccountScope.WORKSPACE
          ? 'Workspace shared'
          : 'Just for me',
      ),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /Add connection/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/OAuth is not yet set up/),
    ).not.toBeInTheDocument();
  });
});
