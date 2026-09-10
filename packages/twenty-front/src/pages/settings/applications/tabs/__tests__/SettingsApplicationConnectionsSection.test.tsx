import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

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

jest.mock('~/pages/settings/applications/hooks/useTriggerAppOAuth', () => ({
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
          visibility: 'workspace',
          isOwnedByCurrentUser: true,
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
    expect(screen.getByText('Workspace shared')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Reconnect' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
  });

  it('adds a workspace shared connection without asking for a visibility', async () => {
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

    expect(screen.queryByText('Just for me')).not.toBeInTheDocument();
    expect(mockTriggerAppOAuth).toHaveBeenCalledTimes(1);
    expect(mockTriggerAppOAuth).toHaveBeenCalledWith({
      applicationId: 'app-1',
      providerName: 'google-calendar',
      visibility: 'workspace',
    });
  });
});
