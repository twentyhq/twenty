import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { SettingsApplicationsAvailableTab } from '~/pages/settings/applications/tabs/SettingsApplicationsAvailableTab';

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

const renderTab = () =>
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <SettingsApplicationsAvailableTab />
      </MemoryRouter>
    </I18nProvider>,
  );

describe('SettingsApplicationsAvailableTab', () => {
  it('shows listed applications only by default', () => {
    renderTab();

    expect(screen.getByText('Listed app')).toBeInTheDocument();
    expect(screen.queryByText('Unlisted app')).not.toBeInTheDocument();
    expect(screen.queryByText(UNLISTED_WARNING)).not.toBeInTheDocument();
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
