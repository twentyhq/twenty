import { act, render, screen } from '@testing-library/react';
import { useRef } from 'react';

import { useMediaLoadStatus } from '@/activities/files/hooks/useMediaLoadStatus';

const TestHarness = ({ isEnabled = true }: { isEnabled?: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const status = useMediaLoadStatus({ containerRef, isEnabled });

  return (
    <div ref={containerRef}>
      <video data-testid="media" />
      <span data-testid="status">{status}</span>
    </div>
  );
};

const dispatchOnMedia = (eventName: string) => {
  const media = screen.getByTestId('media');

  act(() => {
    // Media events do not bubble, which is the whole point of listening in the
    // capture phase.
    media.dispatchEvent(new Event(eventName, { bubbles: false }));
  });
};

describe('useMediaLoadStatus', () => {
  it('starts in the loading state', () => {
    render(<TestHarness />);

    expect(screen.getByTestId('status')).toHaveTextContent('loading');
  });

  it('reports ready once the media has data, even though loadeddata does not bubble', () => {
    render(<TestHarness />);

    dispatchOnMedia('loadeddata');

    expect(screen.getByTestId('status')).toHaveTextContent('ready');
  });

  it('reports error when the media fails to load', () => {
    render(<TestHarness />);

    dispatchOnMedia('error');

    expect(screen.getByTestId('status')).toHaveTextContent('error');
  });

  it('stays loading when disabled, so non-media previews are untouched', () => {
    render(<TestHarness isEnabled={false} />);

    dispatchOnMedia('loadeddata');

    expect(screen.getByTestId('status')).toHaveTextContent('loading');
  });
});
