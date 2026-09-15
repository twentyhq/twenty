import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsApplicationActionButton } from '@/settings/applications/components/SettingsApplicationActionButton';

const mockOpenModal = jest.fn();
const mockConfirmationModal = jest.fn();

jest.mock('@/ui/layout/modal/hooks/useModal', () => ({
  useModal: () => ({ openModal: mockOpenModal }),
}));

jest.mock('@/ui/layout/modal/components/ConfirmationModal', () => ({
  ConfirmationModal: (props: {
    confirmButtonText: string;
    modalInstanceId: string;
    onConfirmClick: () => void;
  }) => {
    mockConfirmationModal(props);

    return (
      <button onClick={props.onConfirmClick}>
        Confirm {props.confirmButtonText}
      </button>
    );
  },
}));

type RenderActionButtonOptions = {
  isInstalled?: boolean;
  canInstallMarketplaceApps?: boolean;
  onInstall?: () => void;
  isInstalling?: boolean;
  hasUpdate?: boolean;
  latestAvailableVersion?: string;
  onUpgrade?: () => void;
  canBeUninstalled?: boolean;
  onUninstall?: () => void;
};

const renderActionButton = ({
  isInstalled = false,
  canInstallMarketplaceApps = true,
  onInstall,
  isInstalling,
  hasUpdate,
  latestAvailableVersion,
  onUpgrade,
  canBeUninstalled,
  onUninstall,
}: RenderActionButtonOptions = {}) =>
  render(
    <I18nProvider i18n={i18n}>
      <SettingsApplicationActionButton
        isInstalled={isInstalled}
        canInstallMarketplaceApps={canInstallMarketplaceApps}
        onInstall={onInstall}
        isInstalling={isInstalling}
        hasUpdate={hasUpdate}
        latestAvailableVersion={latestAvailableVersion}
        onUpgrade={onUpgrade}
        canBeUninstalled={canBeUninstalled}
        onUninstall={onUninstall}
      />
    </I18nProvider>,
  );

describe('SettingsApplicationActionButton', () => {
  beforeEach(() => {
    mockOpenModal.mockClear();
    mockConfirmationModal.mockClear();
  });

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

  it('offers the upgrade when a newer version is available', async () => {
    const user = userEvent.setup();
    const onUpgrade = jest.fn();

    renderActionButton({
      isInstalled: true,
      hasUpdate: true,
      latestAvailableVersion: '2.0.0',
      onUpgrade,
    });

    await user.click(
      screen.getByRole('button', { name: /^Upgrade to 2\.0\.0\b/ }),
    );

    expect(onUpgrade).toHaveBeenCalledTimes(1);
  });

  it('asks for confirmation before uninstalling', async () => {
    const user = userEvent.setup();
    const onUninstall = jest.fn();

    renderActionButton({
      isInstalled: true,
      canBeUninstalled: true,
      onUninstall,
    });

    await user.click(screen.getByRole('button', { name: /^Uninstall\b/ }));

    const { modalInstanceId } = mockConfirmationModal.mock.lastCall[0];

    expect(mockOpenModal).toHaveBeenCalledWith(modalInstanceId);
    expect(onUninstall).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole('button', { name: /^Confirm Uninstall\b/ }),
    );

    expect(onUninstall).toHaveBeenCalledTimes(1);
  });

  it('shows a disabled installed state when nothing else applies', () => {
    renderActionButton({ isInstalled: true });

    expect(screen.getByRole('button', { name: /^Installed\b/ })).toBeDisabled();
  });
});
