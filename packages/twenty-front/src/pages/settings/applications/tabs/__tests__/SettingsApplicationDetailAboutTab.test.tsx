import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';

import { SettingsApplicationDetailAboutTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailAboutTab';

const mockOpenModal = jest.fn();

jest.mock('@/ui/layout/modal/hooks/useModal', () => ({
  useModal: jest.fn(() => ({
    openModal: mockOpenModal,
  })),
}));

jest.mock('@/ui/layout/modal/components/ConfirmationModal', () => ({
  ConfirmationModal: () => null,
}));

jest.mock('@/ai/components/LazyMarkdownRenderer', () => ({
  LazyMarkdownRenderer: ({ text }: { text: string }) => <div>{text}</div>,
}));

const renderWithI18n = (children: ReactNode) =>
  render(<I18nProvider i18n={i18n}>{children}</I18nProvider>);

describe('SettingsApplicationDetailAboutTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps the uninstall button available when an upgrade is available', async () => {
    renderWithI18n(
      <SettingsApplicationDetailAboutTab
        displayName="My App"
        isInstalled={true}
        canInstallMarketplaceApps={true}
        canBeUninstalled={true}
        onUninstall={jest.fn()}
        hasUpdate={true}
        latestAvailableVersion="1.2.0"
        onUpgrade={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: /Upgrade to 1\.2\.0/ }),
    ).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: /Uninstall/ }));

    expect(mockOpenModal).toHaveBeenCalledWith('uninstall-application-modal');
  });

  it('shows only the uninstall button when the application is up to date', () => {
    renderWithI18n(
      <SettingsApplicationDetailAboutTab
        displayName="My App"
        isInstalled={true}
        canInstallMarketplaceApps={true}
        canBeUninstalled={true}
        onUninstall={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Uninstall/ })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /Upgrade/ }),
    ).not.toBeInTheDocument();
  });

  it('shows the installed state when the application can neither be upgraded nor uninstalled', () => {
    renderWithI18n(
      <SettingsApplicationDetailAboutTab
        displayName="My App"
        isInstalled={true}
        canInstallMarketplaceApps={true}
        canBeUninstalled={false}
      />,
    );

    expect(screen.getByRole('button', { name: /Installed/ })).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: /Uninstall/ }),
    ).not.toBeInTheDocument();
  });
});
