import { render, screen } from '@testing-library/react';

import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';

const buildChips = (count: number) =>
  Array.from({ length: count }, (_, index) => (
    <span key={index} data-testid="chip">
      chip-{index}
    </span>
  ));

describe('ExpandableList', () => {
  it('mounts every child inline when no cap is provided', () => {
    render(<ExpandableList>{buildChips(5)}</ExpandableList>);

    expect(screen.getAllByTestId('chip')).toHaveLength(5);
  });

  it('mounts only maxInlineCount children inline when capped', () => {
    render(<ExpandableList maxInlineCount={2}>{buildChips(5)}</ExpandableList>);

    expect(screen.getAllByTestId('chip')).toHaveLength(2);
  });
});
