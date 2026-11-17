import { fireEvent, render, screen } from '@testing-library/react';

import { useStickToBottomScroll } from '@/activities/emails/hooks/useStickToBottomScroll';

const originalResizeObserver = globalThis.ResizeObserver;

let triggerResize = () => {};

class ResizeObserverStub implements ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    triggerResize = () => callback([], this);
  }

  observe() {}

  unobserve() {}

  disconnect() {}
}

const ScrollContainer = () => {
  const { scrollContainerRef, scrollContentRef } = useStickToBottomScroll();

  return (
    <div role="log" ref={scrollContainerRef}>
      <div ref={scrollContentRef} />
    </div>
  );
};

const renderScrollContainer = () => {
  render(<ScrollContainer />);

  const scrollContainer = screen.getByRole('log');
  let scrollHeight = 500;

  Object.defineProperty(scrollContainer, 'clientHeight', { value: 100 });
  Object.defineProperty(scrollContainer, 'scrollHeight', {
    get: () => scrollHeight,
  });

  const growContentTo = (height: number) => {
    scrollHeight = height;
    triggerResize();
  };

  return { scrollContainer, growContentTo };
};

describe('useStickToBottomScroll', () => {
  beforeEach(() => {
    globalThis.ResizeObserver = ResizeObserverStub;
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
  });

  it('follows the bottom when content grows after render', () => {
    const { scrollContainer, growContentTo } = renderScrollContainer();

    growContentTo(800);

    expect(scrollContainer.scrollTop).toBe(800);
  });

  it('leaves the position alone once the reader scrolled up', () => {
    const { scrollContainer, growContentTo } = renderScrollContainer();

    scrollContainer.scrollTop = 0;
    fireEvent.scroll(scrollContainer);
    growContentTo(800);

    expect(scrollContainer.scrollTop).toBe(0);
  });
});
