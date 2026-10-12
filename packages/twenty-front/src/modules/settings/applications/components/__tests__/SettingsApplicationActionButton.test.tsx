import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { SettingsApplicationActionButton } from '@/settings/applications/components/SettingsApplicationActionButton';

const INSTALLED_APPLICATION_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

type RenderActionButtonOptions = {
  installedApplicationId?: string;
  canInstallMarketplaceApps?: boolean;
  onInstall?: () => void;
  isInstalling?: boolean;
  installProgress?: number;
};

const renderActionButton = ({
  installedApplicationId,
  canInstallMarketplaceApps = true,
  onInstall,
  isInstalling,
  installProgress,
}: RenderActionButtonOptions = {}) =>
  render(
    <MemoryRouter>
      <I18nProvider i18n={i18n}>
        <SettingsApplicationActionButton
          installedApplicationId={installedApplicationId}
          canInstallMarketplaceApps={canInstallMarketplaceApps}
          onInstall={onInstall}
          isInstalling={isInstalling}
          installProgress={installProgress}
        />
      </I18nProvider>
    </MemoryRouter>,
  );

describe('SettingsApplicationActionButton', () => {
  it('renders nothing without the applications permission', () => {
    const { container } = renderActionButton({
      canInstallMarketplaceApps: false,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('installs the application', async () => {
    const user = userEvent.setup();
    const onInstall = jest.fn();

    renderActionButton({ onInstall });

    await user.click(screen.getByRole('button', { name: /^Install\b/ }));

    expect(onInstall).toHaveBeenCalledTimes(1);
  });

  it('disables the button and communicates a busy state while installing', () => {
    renderActionButton({ isInstalling: true });

    const button = screen.getByRole('button', { name: /^Installing\b/ });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('shows the installation progress in the label while installing', () => {
    renderActionButton({ isInstalling: true, installProgress: 60 });

    expect(
      screen.getByRole('button', { name: 'Installing (60%)' }),
    ).toBeDisabled();
  });

  it('starts the installation progress at zero before the first progress event', () => {
    renderActionButton({ isInstalling: true });

    expect(
      screen.getByRole('button', { name: 'Installing (0%)' }),
    ).toBeDisabled();
  });

  it('pads a single-digit percentage so the button keeps its width', () => {
    renderActionButton({ isInstalling: true, installProgress: 7 });

    expect(screen.getByRole('button').textContent).toContain(
      'Installing \u2007(7%)',
    );
  });

  it('links to the application settings once installed', () => {
    renderActionButton({ installedApplicationId: INSTALLED_APPLICATION_ID });

    expect(
      screen.getByRole('link', { name: /^Open settings\b/ }),
    ).toHaveAttribute(
      'href',
      `/settings/applications/${INSTALLED_APPLICATION_ID}`,
    );
  });

  it('offers the settings link even without the applications permission', () => {
    renderActionButton({
      installedApplicationId: INSTALLED_APPLICATION_ID,
      canInstallMarketplaceApps: false,
    });

    expect(
      screen.getByRole('link', { name: /^Open settings\b/ }),
    ).toBeVisible();
  });
});
