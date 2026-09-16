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
};

const renderActionButton = ({
  installedApplicationId,
  canInstallMarketplaceApps = true,
  onInstall,
  isInstalling,
}: RenderActionButtonOptions = {}) =>
  render(
    <MemoryRouter>
      <I18nProvider i18n={i18n}>
        <SettingsApplicationActionButton
          installedApplicationId={installedApplicationId}
          canInstallMarketplaceApps={canInstallMarketplaceApps}
          onInstall={onInstall}
          isInstalling={isInstalling}
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

  it('disables the button while installing', () => {
    renderActionButton({ isInstalling: true });

    expect(
      screen.getByRole('button', { name: /^Installing\b/ }),
    ).toBeDisabled();
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
