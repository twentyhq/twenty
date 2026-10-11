import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsApplicationUninstallButton } from '@/settings/applications/components/SettingsApplicationUninstallButton';

const mockOpenDialog = jest.fn();

jest.mock('@/ui/layout/dialog/hooks/useDialog', () => ({
  useDialog: jest.fn(() => ({
    openDialog: mockOpenDialog,
  })),
}));

jest.mock('@/ui/layout/dialog/components/ConfirmationDialog', () => ({
  ConfirmationDialog: () => null,
}));

const DISABLED_REASON =
  'Transfer the app ownership or uninstall it from all other workspaces first.';

const renderUninstallButton = ({
  disabledReason,
}: {
  disabledReason?: string;
} = {}) =>
  render(
    <I18nProvider i18n={i18n}>
      <SettingsApplicationUninstallButton
        onUninstall={jest.fn()}
        disabledReason={disabledReason}
      />
    </I18nProvider>,
  );

describe('SettingsApplicationUninstallButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('asks for confirmation before uninstalling', async () => {
    const user = userEvent.setup();

    renderUninstallButton();

    await user.click(screen.getByRole('button', { name: 'Uninstall' }));

    expect(mockOpenDialog).toHaveBeenCalledTimes(1);
  });

  it('does not show a tooltip while the uninstall is allowed', async () => {
    const user = userEvent.setup();

    renderUninstallButton();

    await user.hover(screen.getByRole('button', { name: 'Uninstall' }));

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('disables the uninstall when a reason is given', async () => {
    const user = userEvent.setup();

    renderUninstallButton({ disabledReason: DISABLED_REASON });

    const button = screen.getByRole('button', { name: 'Uninstall' });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(mockOpenDialog).not.toHaveBeenCalled();
  });

  it('explains why the uninstall is disabled', async () => {
    const user = userEvent.setup();

    renderUninstallButton({ disabledReason: DISABLED_REASON });

    await user.tab();

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      DISABLED_REASON,
    );
  });
});
