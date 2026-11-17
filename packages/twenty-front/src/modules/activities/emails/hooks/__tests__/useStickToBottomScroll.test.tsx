import { fireEvent, render, screen } from '@testing-library/react';

import { useStickToBottomScroll } from '@/activities/emails/hooks/useStickToBottomScroll';

const originalResizeObserver = globalThis.ResizeObserver;

let resizeElement = (_element: Element) => {};

class ResizeObserverStub implements ResizeObserver {
  private observedElements = new Set<Element>();

  constructor(callback: ResizeObserverCallback) {
    resizeElement = (element) => {
      if (this.observedElements.has(element)) {
        callback([], this);
      }
    };
  }

  observe(element: Element) {
    this.observedElements.add(element);
  }

  unobserve() {}

  disconnect() {}
}

const ScrollContainer = () => {
  const { scrollContainerRef, scrollContentRef } = useStickToBottomScroll();

  return (
    <div role="log" ref={scrollContainerRef}>
      <div ref={scrollContentRef}>messages</div>
    </div>
  );
};

const renderScrollContainer = () => {
  render(<ScrollContainer />);

  const scrollContainer = screen.getByRole('log');
  const scrollContent = screen.getByText('messages');
  let scrollHeight = 500;
  let clientHeight = 100;

  Object.defineProperty(scrollContainer, 'scrollHeight', {
    get: () => scrollHeight,
  });
  Object.defineProperty(scrollContainer, 'clientHeight', {
    get: () => clientHeight,
  });

  const growContentTo = (height: number) => {
    scrollHeight = height;
    resizeElement(scrollContent);
  };

  const shrinkViewportTo = (height: number) => {
    clientHeight = height;
    resizeElement(scrollContainer);
  };

  return { scrollContainer, growContentTo, shrinkViewportTo };
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

  it('follows the bottom when the composer takes space from the thread', () => {
    const { scrollContainer, shrinkViewportTo } = renderScrollContainer();

    shrinkViewportTo(60);

    expect(scrollContainer.scrollTop).toBe(500);
  });

  it('leaves the position alone once the reader scrolled up', () => {
    const { scrollContainer, growContentTo, shrinkViewportTo } =
      renderScrollContainer();

    scrollContainer.scrollTop = 0;
    fireEvent.scroll(scrollContainer);
    growContentTo(800);
    shrinkViewportTo(60);

    expect(scrollContainer.scrollTop).toBe(0);
  });
});
