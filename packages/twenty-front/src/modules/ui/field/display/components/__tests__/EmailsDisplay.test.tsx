import { render, screen } from '@testing-library/react';

import { EmailsDisplay } from '@/ui/field/display/components/EmailsDisplay';

describe('EmailsDisplay', () => {
  it('lays out each email by its own direction', () => {
    render(
      <div dir="rtl">
        <EmailsDisplay
          value={{
            primaryEmail: 'john.levi@globex.co.il',
            additionalEmails: ['dana@acme-solutions.co.il'],
          }}
        />
      </div>,
    );

    expect(
      screen.getByRole('link', { name: 'john.levi@globex.co.il' }),
    ).toHaveAttribute('dir', 'auto');
    expect(
      screen.getByRole('link', { name: 'dana@acme-solutions.co.il' }),
    ).toHaveAttribute('dir', 'auto');
  });
});
