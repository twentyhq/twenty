import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { EmailsDisplay } from '@/ui/field/display/components/EmailsDisplay';

describe('EmailsDisplay', () => {
  it('lays out each email by its own direction', () => {
    render(
      <I18nProvider i18n={i18n}>
        <div dir="rtl">
          <EmailsDisplay
            value={{
              primaryEmail: 'john.levi@globex.co.il',
              additionalEmails: ['dana@acme-solutions.co.il'],
            }}
          />
        </div>
      </I18nProvider>,
    );

    expect(
      screen.getByRole('link', { name: 'john.levi@globex.co.il' }),
    ).toHaveAttribute('dir', 'auto');
    expect(
      screen.getByRole('link', { name: 'dana@acme-solutions.co.il' }),
    ).toHaveAttribute('dir', 'auto');
  });
});
