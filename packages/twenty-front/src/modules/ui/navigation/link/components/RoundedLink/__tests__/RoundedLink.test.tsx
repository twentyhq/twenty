import { render, screen } from '@testing-library/react';

import { RoundedLink } from '@/ui/navigation/link/components/RoundedLink/RoundedLink';

describe('RoundedLink', () => {
  it('lays out its label by the label direction by default', () => {
    render(
      <div dir="rtl">
        <RoundedLink
          href="mailto:john.levi@globex.co.il"
          label="john.levi@globex.co.il"
        />
      </div>,
    );

    expect(
      screen.getByRole('link', { name: 'john.levi@globex.co.il' }),
    ).toHaveAttribute('dir', 'auto');
  });

  it('forwards an explicit direction', () => {
    render(
      <RoundedLink
        href="tel:+972521234567"
        label="+972 52 123 4567"
        dir="ltr"
      />,
    );

    expect(
      screen.getByRole('link', { name: '+972 52 123 4567' }),
    ).toHaveAttribute('dir', 'ltr');
  });

  it('renders the label in its own element so it can be ellipsized inside the chip', () => {
    render(
      <RoundedLink
        href="mailto:sarah.miller.operations@initech.com"
        label="sarah.miller.operations@initech.com"
      />,
    );

    const link = screen.getByRole('link', {
      name: 'sarah.miller.operations@initech.com',
    });
    const label = screen.getByText('sarah.miller.operations@initech.com');

    expect(label).not.toBe(link);
    expect(link).toContainElement(label);
  });
});
