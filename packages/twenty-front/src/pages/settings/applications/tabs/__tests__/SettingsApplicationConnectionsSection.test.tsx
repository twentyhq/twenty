import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  Dropdown: ({
    clickableComponent,
    dropdownComponents,
  }: {
    clickableComponent: ReactNode;
    dropdownComponents: ReactNode;
  }) => (
    <div>
      {clickableComponent}
      <div role="menu">{dropdownComponents}</div>
    </div>
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

const PERSONAL_CONNECTION = {
  __typename: 'ConnectedAccountPublicDTO' as const,
  id: 'account-1',
  handle: 'me@example.com',
  provider: 'app',
  authFailedAt: null,
  scopes: ['calendar.readonly'],
  handleAliases: [],
  lastSignedInAt: null,
  userWorkspaceId: 'user-workspace-1',
  connectionProviderId: 'provider-1',
  name: 'Main connection',
  visibility: 'user',
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

const pickJustForMe = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(within(screen.getByRole('menu')).getByText('Just for me'));
};

const pickWorkspaceShared = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  await user.click(
    within(screen.getByRole('menu')).getByText('Workspace shared'),
  );
};

describe('SettingsApplicationConnectionsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders app connection rows as links to the connection detail page', () => {
    mockConnectionProviders({ isClientCredentialsConfigured: false });

    mockedUseMyAppConnectedAccounts.mockReturnValue({
      accounts: [
        {
          __typename: 'ConnectedAccountPublicDTO',
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
        },
      ],
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
      screen.queryByRole('button', { name: /Reconnect/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Delete/ }),
    ).not.toBeInTheDocument();
  });

  it('starts the OAuth redirect right away when there is no connection yet', async () => {
    const user = userEvent.setup();

    mockConnectionProviders({ isClientCredentialsConfigured: true });
    mockedUseMyAppConnectedAccounts.mockReturnValue({
      accounts: [],
      loading: false,
      refetch: jest.fn(),
    });

    renderSection();

    await pickJustForMe(user);

    expect(mockTriggerAppOAuth).toHaveBeenCalledWith({
      applicationId: 'app-1',
      providerName: 'google-calendar',
      visibility: 'user',
    });
    expect(
      screen.queryByRole('button', { name: /Connect a different account/ }),
    ).not.toBeInTheDocument();
  });

  it('offers to reconnect the existing personal connection instead of adding a second one', async () => {
    const user = userEvent.setup();

    mockConnectionProviders({ isClientCredentialsConfigured: true });
    mockedUseMyAppConnectedAccounts.mockReturnValue({
      accounts: [PERSONAL_CONNECTION],
      loading: false,
      refetch: jest.fn(),
    });

    renderSection();

    await pickJustForMe(user);

    expect(
      screen.getByText('You already have a Google Calendar connection'),
    ).toBeVisible();
    expect(mockTriggerAppOAuth).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole('button', { name: /Reconnect Main connection/ }),
    );

    expect(mockTriggerAppOAuth).toHaveBeenCalledWith({
      applicationId: 'app-1',
      providerName: 'google-calendar',
      visibility: 'user',
      reconnectingConnectedAccountId: 'account-1',
    });
  });

  it('shares the existing personal connection when workspace visibility is picked', async () => {
    const user = userEvent.setup();

    mockConnectionProviders({ isClientCredentialsConfigured: true });
    mockedUseMyAppConnectedAccounts.mockReturnValue({
      accounts: [PERSONAL_CONNECTION],
      loading: false,
      refetch: jest.fn(),
    });

    renderSection();

    await pickWorkspaceShared(user);

    await user.click(
      screen.getByRole('button', {
        name: /Reconnect and share Main connection/,
      }),
    );

    expect(mockTriggerAppOAuth).toHaveBeenCalledWith({
      applicationId: 'app-1',
      providerName: 'google-calendar',
      visibility: 'workspace',
      reconnectingConnectedAccountId: 'account-1',
    });
  });

  it('still lets the user connect a different account from the modal', async () => {
    const user = userEvent.setup();

    mockConnectionProviders({ isClientCredentialsConfigured: true });
    mockedUseMyAppConnectedAccounts.mockReturnValue({
      accounts: [PERSONAL_CONNECTION],
      loading: false,
      refetch: jest.fn(),
    });

    renderSection();

    await pickJustForMe(user);

    await user.click(
      screen.getByRole('button', { name: /Connect a different account/ }),
    );

    expect(mockTriggerAppOAuth).toHaveBeenCalledWith({
      applicationId: 'app-1',
      providerName: 'google-calendar',
      visibility: 'user',
    });
  });
});
