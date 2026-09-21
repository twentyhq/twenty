import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsApplicationMissingConfigurationBanner } from '~/pages/settings/applications/components/SettingsApplicationMissingConfigurationBanner';

const renderBanner = ({
  missingApplicationVariables = [{ key: 'API_KEY', label: 'API key' }],
  onConfigure = jest.fn(),
}: {
  missingApplicationVariables?: { key: string; label: string }[];
  onConfigure?: () => void;
} = {}) => {
  render(
    <I18nProvider i18n={i18n}>
      <SettingsApplicationMissingConfigurationBanner
        missingApplicationVariables={missingApplicationVariables}
        onConfigure={onConfigure}
      />
    </I18nProvider>,
  );

  return { onConfigure };
};

describe('SettingsApplicationMissingConfigurationBanner', () => {
  it('should list the labels of the missing variables', () => {
    renderBanner({
      missingApplicationVariables: [
        { key: 'API_KEY', label: 'API key' },
        { key: 'REGION', label: 'Region' },
      ],
    });

    expect(screen.getByText(/API key, Region/)).toBeInTheDocument();
  });

  it('should fall back to the variable key when it has no label', () => {
    renderBanner({
      missingApplicationVariables: [{ key: 'API_KEY', label: '' }],
    });

    expect(screen.getByText(/API_KEY/)).toBeInTheDocument();
  });

  it('should call onConfigure when the action is clicked', async () => {
    const { onConfigure } = renderBanner();

    await userEvent.click(screen.getByRole('button', { name: /Configure/ }));

    expect(onConfigure).toHaveBeenCalledTimes(1);
  });
});
