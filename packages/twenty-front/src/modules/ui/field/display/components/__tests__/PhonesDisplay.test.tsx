import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { PhonesDisplay } from '@/ui/field/display/components/PhonesDisplay';

describe('PhonesDisplay', () => {
  it('lays each phone number out left to right', () => {
    render(
      <I18nProvider i18n={i18n}>
        <div dir="rtl">
          <PhonesDisplay
            value={{
              primaryPhoneNumber: '521234567',
              primaryPhoneCountryCode: 'IL',
              primaryPhoneCallingCode: '+972',
              additionalPhones: [
                { number: '2071234567', callingCode: '+44', countryCode: 'GB' },
              ],
            }}
          />
        </div>
      </I18nProvider>,
    );

    const primaryPhone = screen.getByRole('link', {
      name: '+972 52 123 4567',
    });
    const additionalPhone = screen.getByRole('link', {
      name: '+44 20 7123 4567',
    });

    expect(primaryPhone).toHaveAttribute('dir', 'ltr');
    expect(additionalPhone).toHaveAttribute('dir', 'ltr');
  });
});
