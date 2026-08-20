import { ActivityRow } from '@/activities/components/ActivityRow';
import { render, screen } from '@testing-library/react';

describe('ActivityRow', () => {
  it('highlights clickable rows on hover', () => {
    render(<ActivityRow>content</ActivityRow>);

    expect(screen.getByText('content')).toHaveAttribute(
      'data-hover-highlight',
      'true',
    );
  });

  it('does not highlight disabled rows on hover', () => {
    render(<ActivityRow disabled>content</ActivityRow>);

    expect(screen.getByText('content')).not.toHaveAttribute(
      'data-hover-highlight',
    );
  });
});
