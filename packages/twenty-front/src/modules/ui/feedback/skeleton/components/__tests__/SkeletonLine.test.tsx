import { render } from '@testing-library/react';

import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';

describe('SkeletonLine', () => {
  it('groups repeated placeholders and line breaks in one loading region', () => {
    const { container } = render(<SkeletonLine count={3} height={32} />);
    const loadingRegions = container.querySelectorAll('[aria-live="polite"]');
    const loadingRegion = loadingRegions[0];

    expect(loadingRegions).toHaveLength(1);
    expect(loadingRegion).toHaveAttribute('aria-busy', 'true');
    expect(loadingRegion.querySelectorAll('[aria-hidden="true"]')).toHaveLength(
      3,
    );
    expect(loadingRegion.querySelectorAll('br')).toHaveLength(3);

    for (const placeholder of loadingRegion.querySelectorAll(
      '[aria-hidden="true"]',
    )) {
      expect(placeholder.nextElementSibling?.tagName).toBe('BR');
    }
  });

  it('stops marking the loading region busy when animation is disabled', () => {
    const { container, rerender } = render(<SkeletonLine />);

    rerender(<SkeletonLine animated={false} />);

    expect(container.querySelector('[aria-live="polite"]')).toHaveAttribute(
      'aria-busy',
      'false',
    );
    expect(container.querySelector('[aria-hidden="true"]')).not.toHaveAttribute(
      'data-animated',
    );
  });
});
