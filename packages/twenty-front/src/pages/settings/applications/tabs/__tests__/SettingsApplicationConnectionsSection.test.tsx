import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { SettingsApplicationConnectionsSection } from '~/pages/settings/applications/tabs/SettingsApplicationConnectionsSection';
import { useFindApplicationConnectionProviders } from '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders';
import { useMyAppConnectedAccounts } from '~/pages/settings/applications/hooks/useMyAppConnectedAccounts';

const mockTriggerAppOAuth = jest.fn();

jest.mock(
  '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders',
  () => ({
    useFindApplicationConnectionProviders: jest.fn(),
  }),
);

jest.mock(
  '~/pages/settings/applications/hooks/useMyAppConnectedAccounts',
  () => ({
    useMyAppConnectedAccounts: jest.fn(),
  }),
);

jest.mock('~/pages/settings/applications/hooks/useTriggerAppOAuth', () => ({
  useTriggerAppOAuth: jest.fn(() => ({
    triggerAppOAuth: mockTriggerAppOAuth,
  })),
}));

jest.mock('@/ui/layout/dropdown/components/Dropdown', () => ({
  Dropdown: ({ clickableComponent }: { clickableComponent: ReactNode }) => (
    <div>{clickableComponent}</div>
  ),
}));

const mockedUseFindApplicationConnectionProviders =
  useFindApplicationConnectionProviders as jest.MockedFunction<
    typeof useFindApplicationConnectionProviders
  >;

const mockedUseMyAppConnectedAccounts =
  useMyAppConnectedAccounts as jest.MockedFunction<
    typeof useMyAppConnectedAccounts
  >;

const mockConnectionProviders = ({
  isClientCredentialsConfigured,
}: {
  isClientCredentialsConfigured: boolean;
}) => {
  mockedUseFindApplicationConnectionProviders.mockReturnValue({
    connectionProviders: [
      {
        id: 'provider-1',
        applicationId: 'app-1',
        type: 'oauth',
        name: 'google-calendar',
        displayName: 'Google Calendar',
        logoUrl: null,
        oauth: {
          scopes: ['calendar.readonly'],
          isClientCredentialsConfigured,
        },
      },
    ],
    loading: false,
    refetch: jest.fn(),
  });
};

const OWN_CONNECTION = {
  __typename: 'ConnectedAccountPublicDTO' as const,
  id: 'account-1',
  handle: 'workspace@example.com',
  provider: 'app',
  authFailedAt: '2026-05-01T00:00:00.000Z',
  scopes: ['calendar.readonly'],
  handleAliases: [],
  lastSignedInAt: null,
  userWorkspaceId: 'user-workspace-1',
  connectionProviderId: 'provider-1',
  name: 'Main connection',
  visibility: 'workspace',
  lastCredentialsRefreshedAt: null,
  connectionParameters: null,
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
};

const renderSection = () =>
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <SettingsApplicationConnectionsSection applicationId="app-1" />
      </MemoryRouter>
    </I18nProvider>,
  );

describe('SettingsApplicationConnectionsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders app connection rows as links to the connection detail page', () => {
    mockConnectionProviders({ isClientCredentialsConfigured: false });
    mockedUseMyAppConnectedAccounts.mockReturnValue({
      accounts: [OWN_CONNECTION],
      loading: false,
      refetch: jest.fn(),
    });

    renderSection();

    expect(
      screen.getByRole('link', { name: /Main connection/i }),
    ).toHaveAttribute(
      'href',
      '/settings/applications/app-1/connections/account-1',
    );
    expect(screen.getByText('Reconnect needed')).toBeVisible();
    expect(screen.getByText('Workspace shared')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Reconnect' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
  });

  it('offers Add connection when the user has none for the provider', () => {
    mockConnectionProviders({ isClientCredentialsConfigured: true });
    mockedUseMyAppConnectedAccounts.mockReturnValue({
      accounts: [],
      loading: false,
      refetch: jest.fn(),
    });

    renderSection();

    expect(
      screen.getByRole('button', { name: /Add connection/ }),
    ).toBeVisible();
  });

  it('hides Add connection once the user already has one for the provider', () => {
    mockConnectionProviders({ isClientCredentialsConfigured: true });
    mockedUseMyAppConnectedAccounts.mockReturnValue({
      accounts: [OWN_CONNECTION],
      loading: false,
      refetch: jest.fn(),
    });

    renderSection();

    expect(
      screen.queryByRole('button', { name: /Add connection/ }),
    ).not.toBeInTheDocument();
  });

  it('hides Add connection while connected accounts are still loading', () => {
    mockConnectionProviders({ isClientCredentialsConfigured: true });
    mockedUseMyAppConnectedAccounts.mockReturnValue({
      accounts: [],
      loading: true,
      refetch: jest.fn(),
    });

    renderSection();

    expect(
      screen.queryByRole('button', { name: /Add connection/ }),
    ).not.toBeInTheDocument();
  });
});
