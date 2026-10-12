import { render, screen } from '@testing-library/react';

import { PhoneDisplay } from '@/ui/field/display/components/PhoneDisplay';

describe('PhoneDisplay', () => {
  it('lays the phone number out left to right', () => {
    render(
      <div dir="rtl">
        <PhoneDisplay value={{ number: '521234567', callingCode: '+972' }} />
      </div>,
    );

    expect(
      screen.getByRole('link', { name: '+972 52 123 4567' }),
    ).toHaveAttribute('dir', 'ltr');
  });
});
