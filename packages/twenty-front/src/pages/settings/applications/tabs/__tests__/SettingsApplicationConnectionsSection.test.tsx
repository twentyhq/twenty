import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { ConnectedAccountScope } from '~/generated-metadata/graphql';
import { SettingsApplicationConnectionsSection } from '~/pages/settings/applications/tabs/SettingsApplicationConnectionsSection';
import { useFindApplicationConnectionProviders } from '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders';
import { useApplicationConnectedAccounts } from '~/pages/settings/applications/hooks/useApplicationConnectedAccounts';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';

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

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: jest.fn(() => false),
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: jest.fn(() => true),
}));

jest.mock('@/settings/applications/hooks/useTriggerAppOAuth', () => ({
  useTriggerAppOAuth: jest.fn(() => ({
    triggerAppOAuth: mockTriggerAppOAuth,
  })),
}));

const mockedUseIsFeatureEnabled = jest.mocked(useIsFeatureEnabled);
const mockedUseHasPermissionFlag = jest.mocked(useHasPermissionFlag);

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
    mockedUseIsFeatureEnabled.mockReturnValue(false);
    mockedUseHasPermissionFlag.mockReturnValue(true);
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
    expect(screen.getByText('Workspace shared')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Reconnect' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
  });

  it('adds a workspace shared connection without asking for a scope', async () => {
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

    expect(screen.queryByText('Just for me')).not.toBeInTheDocument();
    expect(mockTriggerAppOAuth).toHaveBeenCalledTimes(1);
    expect(mockTriggerAppOAuth).toHaveBeenCalledWith({
      applicationId: 'app-1',
      providerName: 'google-calendar',
      scope: 'WORKSPACE',
    });
  });

  const buildProvider = (scope: 'USER' | 'WORKSPACE') => ({
    id: 'provider-1',
    applicationId: 'app-1',
    type: 'oauth' as const,
    name: 'google-calendar',
    displayName: 'Google Calendar',
    scope,
    logoUrl: null,
    oauth: {
      scopes: ['calendar.readonly'],
      isClientCredentialsConfigured: true,
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
    isAppPreferencesEnabled,
    hasConnectedAccountsPermission,
  }: {
    providerScope: 'USER' | 'WORKSPACE';
    accounts: ReturnType<typeof buildAccount>[];
    isAppPreferencesEnabled: boolean;
    hasConnectedAccountsPermission: boolean;
  }) => {
    mockedUseIsFeatureEnabled.mockReturnValue(isAppPreferencesEnabled);
    mockedUseHasPermissionFlag.mockReturnValue(hasConnectedAccountsPermission);
    mockedUseFindApplicationConnectionProviders.mockReturnValue({
      connectionProviders: [buildProvider(providerScope)],
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

  describe.each([
    {
      isAppPreferencesEnabled: false,
      hasConnectedAccountsPermission: true,
      isPersonalRowListed: true,
    },
    {
      isAppPreferencesEnabled: true,
      hasConnectedAccountsPermission: true,
      isPersonalRowListed: false,
    },
    {
      isAppPreferencesEnabled: true,
      hasConnectedAccountsPermission: false,
      isPersonalRowListed: true,
    },
  ])(
    'with App preferences enabled: $isAppPreferencesEnabled and connected accounts permission: $hasConnectedAccountsPermission',
    ({
      isAppPreferencesEnabled,
      hasConnectedAccountsPermission,
      isPersonalRowListed,
    }) => {
      it('lists the shared row of a workspace provider, and the personal one only when not managed in App preferences', () => {
        renderSection({
          providerScope: 'WORKSPACE',
          accounts: [SHARED_ACCOUNT, PERSONAL_ACCOUNT],
          isAppPreferencesEnabled,
          hasConnectedAccountsPermission,
        });

        expect(
          screen.getByRole('link', { name: /Team calendar/i }),
        ).toBeVisible();
        if (isPersonalRowListed) {
          expect(screen.getByText('My calendar')).toBeVisible();
        } else {
          expect(screen.queryByText('My calendar')).not.toBeInTheDocument();
        }
        expect(
          screen.getByRole('button', { name: /Add connection/i }),
        ).toBeVisible();
      });

      it('shows a member-scoped provider with only personal rows only when not managed in App preferences', () => {
        renderSection({
          providerScope: 'USER',
          accounts: [PERSONAL_ACCOUNT],
          isAppPreferencesEnabled,
          hasConnectedAccountsPermission,
        });

        if (isPersonalRowListed) {
          expect(screen.getByText('Google Calendar')).toBeVisible();
          expect(screen.getByText('My calendar')).toBeVisible();
        } else {
          expect(screen.queryByText('Google Calendar')).not.toBeInTheDocument();
          expect(screen.queryByText('My calendar')).not.toBeInTheDocument();
        }
        expect(
          screen.queryByRole('button', { name: /Add connection/i }),
        ).not.toBeInTheDocument();
      });

      it('lists the shared row of a member-scoped provider without offering to add one', () => {
        renderSection({
          providerScope: 'USER',
          accounts: [SHARED_ACCOUNT],
          isAppPreferencesEnabled,
          hasConnectedAccountsPermission,
        });

        expect(
          screen.getByRole('link', { name: /Team calendar/i }),
        ).toBeVisible();
        expect(
          screen.queryByRole('button', { name: /Add connection/i }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(/OAuth is not yet set up/),
        ).not.toBeInTheDocument();
      });
    },
  );
});
