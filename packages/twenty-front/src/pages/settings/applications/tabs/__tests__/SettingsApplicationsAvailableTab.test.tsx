import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { SettingsApplicationsAvailableTab } from '~/pages/settings/applications/tabs/SettingsApplicationsAvailableTab';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

jest.mock('@/marketplace/hooks/useMarketplaceApps', () => ({
  useMarketplaceApps: jest.fn(() => ({
    data: [
      {
        __typename: 'MarketplaceApp',
        id: 'listed-app',
        name: 'Listed app',
        description: '',
        author: 'Twenty',
        category: '',
        logoUrl: null,
        sourcePackage: '@twentyhq/listed-app',
        isListed: true,
      },
      {
        __typename: 'MarketplaceApp',
        id: 'unlisted-app',
        name: 'Unlisted app',
        description: '',
        author: 'Community',
        category: '',
        logoUrl: null,
        sourcePackage: 'twenty-app-unlisted',
        isListed: false,
      },
      {
        __typename: 'MarketplaceApp',
        id: '6e58bb83-49dc-4d4d-ae82-662890eda505',
        name: 'ChatGPT',
        description: '',
        author: 'OpenAI',
        category: '',
        logoUrl: null,
        sourcePackage: '@twentyhq/chatgpt',
        isListed: true,
        connectUrl: 'https://chatgpt.com/apps/twenty',
      },
    ],
    isLoading: false,
    error: undefined,
    refetch: jest.fn(),
  })),
}));

jest.mock(
  '~/pages/settings/applications/components/SettingsAvailableApplicationCard',
  () => ({
    SettingsAvailableApplicationCard: ({
      application,
    }: {
      application: { name: string };
    }) => <div>{application.name}</div>,
  }),
);

const UNLISTED_WARNING =
  'Applications below have not been reviewed by Twenty. Use at your own risk.';

const setAppPreferencesFlag = (value: boolean) =>
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [{ key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED, value }],
  });

const renderTab = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <SettingsApplicationsAvailableTab />
        </MemoryRouter>
      </I18nProvider>
    </JotaiProvider>,
  );

describe('SettingsApplicationsAvailableTab', () => {
  beforeEach(() => {
    resetJotaiStore();
    setAppPreferencesFlag(true);
  });

  it('shows listed applications only by default', () => {
    renderTab();

    expect(screen.getByText('Listed app')).toBeInTheDocument();
    expect(screen.getByText('ChatGPT')).toBeInTheDocument();
    expect(screen.queryByText('Unlisted app')).not.toBeInTheDocument();
    expect(screen.queryByText(UNLISTED_WARNING)).not.toBeInTheDocument();
  });

  it('hides ChatGPT when the app preferences flag is off', () => {
    setAppPreferencesFlag(false);

    renderTab();

    expect(screen.getByText('Listed app')).toBeInTheDocument();
    expect(screen.queryByText('ChatGPT')).not.toBeInTheDocument();
  });

  it('shows unlisted applications with a warning once the filter is turned on', async () => {
    const user = userEvent.setup();

    renderTab();

    await user.click(
      screen.getByRole('button', { name: 'Filter applications' }),
    );
    await user.click(await screen.findByText('Show unlisted apps'));

    expect(screen.getByText('Listed app')).toBeInTheDocument();
    expect(screen.getByText('Unlisted app')).toBeInTheDocument();
    expect(screen.getByText(UNLISTED_WARNING)).toBeInTheDocument();
  });
});
