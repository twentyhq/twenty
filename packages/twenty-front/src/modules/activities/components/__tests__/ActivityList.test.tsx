import { ActivityList } from '@/activities/components/ActivityList';
import { render } from '@testing-library/react';

describe('ActivityList', () => {
  it('marks the framed list as its own scroll surface when requested', () => {
    const { container } = render(
      <ActivityList isScrollable>
        <div>First activity</div>
      </ActivityList>,
    );

    expect(container.firstChild).toHaveAttribute('data-scrollable', 'true');
  });
});
