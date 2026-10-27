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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders app connection rows as links to the connection detail page', () => {
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
          scope: ConnectedAccountScope.WORKSPACE,
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

  it('adds a connection to a custom provider without OAuth credentials', async () => {
    mockedUseFindApplicationConnectionProviders.mockReturnValue({
      connectionProviders: [
        {
          id: 'provider-1',
          applicationId: 'app-1',
          type: 'custom',
          name: 'linkedin',
          displayName: 'LinkedIn',
          scope: 'WORKSPACE',
          logoUrl: null,
          oauth: null,
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

    expect(mockTriggerAppOAuth).toHaveBeenCalledWith({
      applicationId: 'app-1',
      providerName: 'linkedin',
    });
  });

  const buildProvider = ({
    scope,
    isClientCredentialsConfigured = true,
  }: {
    scope: 'USER' | 'WORKSPACE';
    isClientCredentialsConfigured?: boolean;
  }) => ({
    id: 'provider-1',
    applicationId: 'app-1',
    type: 'oauth' as const,
    name: 'google-calendar',
    displayName: 'Google Calendar',
    scope,
    logoUrl: null,
    oauth: {
      scopes: ['calendar.readonly'],
      isClientCredentialsConfigured,
    },
  });

  const buildAccount = ({
    id,
    name,
    scope,
  }: {
    id: string;
    name: string;
    scope: ConnectedAccountScope;
  }) => ({
    __typename: 'ApplicationConnectedAccountDTO' as const,
    id,
    handle: `${id}@example.com`,
    authFailedAt: null,
    scopes: ['calendar.readonly'],
    lastSignedInAt: null,
    connectionProviderId: 'provider-1',
    name,
    scope,
    lastCredentialsRefreshedAt: null,
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
  });

  const SHARED_ACCOUNT = buildAccount({
    id: 'shared-account',
    name: 'Team calendar',
    scope: ConnectedAccountScope.WORKSPACE,
  });

  const PERSONAL_ACCOUNT = buildAccount({
    id: 'personal-account',
    name: 'My calendar',
    scope: ConnectedAccountScope.USER,
  });

  const renderSection = ({
    providerScope,
    accounts,
    isClientCredentialsConfigured = true,
  }: {
    providerScope: 'USER' | 'WORKSPACE';
    accounts: ReturnType<typeof buildAccount>[];
    isClientCredentialsConfigured?: boolean;
  }) => {
    mockedUseFindApplicationConnectionProviders.mockReturnValue({
      connectionProviders: [
        buildProvider({ scope: providerScope, isClientCredentialsConfigured }),
      ],
      loading: false,
      refetch: jest.fn(),
    });
    mockedUseApplicationConnectedAccounts.mockReturnValue({
      accounts,
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
  };

  it('lists the rows of a workspace provider', () => {
    renderSection({
      providerScope: 'WORKSPACE',
      accounts: [SHARED_ACCOUNT],
    });

    expect(screen.getByRole('link', { name: /Team calendar/i })).toBeVisible();
    expect(
      screen.getByRole('button', { name: /Add connection/i }),
    ).toBeVisible();
  });

  it('does not list a member-scoped provider', () => {
    renderSection({
      providerScope: 'USER',
      accounts: [PERSONAL_ACCOUNT],
      isClientCredentialsConfigured: false,
    });

    expect(screen.queryByText('Google Calendar')).not.toBeInTheDocument();
    expect(screen.queryByText('My calendar')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Add connection/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/OAuth is not yet set up/),
    ).not.toBeInTheDocument();
  });
});
