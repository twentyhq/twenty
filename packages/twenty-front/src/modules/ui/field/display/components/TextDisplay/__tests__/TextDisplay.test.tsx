import { render, screen } from '@testing-library/react';

import { TextDisplay } from '@/ui/field/display/components/TextDisplay/TextDisplay';

describe('TextDisplay', () => {
  it('renders text with tooltip support and min-width constraint', () => {
    const { container } = render(
      <TextDisplay text="Very long audit trail text value that should not break container flex layout" />,
    );

    expect(
      screen.getByText(
        'Very long audit trail text value that should not break container flex layout',
      ),
    ).toBeInTheDocument();

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
  });

  it('passes displayedMaxRows for multiline text correctly', () => {
    render(<TextDisplay text="First line\nSecond line" displayedMaxRows={3} />);

    expect(screen.getByText('First line\nSecond line')).toBeInTheDocument();
  });
});
