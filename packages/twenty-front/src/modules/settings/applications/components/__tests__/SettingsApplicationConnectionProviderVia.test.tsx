import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { SettingsApplicationConnectionProviderVia } from '@/settings/applications/components/SettingsApplicationConnectionProviderVia';

describe('SettingsApplicationConnectionProviderVia', () => {
  it('should name the third party the connection goes through', () => {
    render(
      <I18nProvider i18n={i18n}>
        <SettingsApplicationConnectionProviderVia
          via={{ name: 'Unipile', description: null }}
        />
      </I18nProvider>,
    );

    expect(screen.getByText('via Unipile')).toBeInTheDocument();
  });
});
