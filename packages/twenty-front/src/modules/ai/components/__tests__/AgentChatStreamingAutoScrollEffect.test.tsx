import { render } from '@testing-library/react';

import { AgentChatStreamingAutoScrollEffect } from '@/ai/components/AgentChatStreamingAutoScrollEffect';

const mockIsScrolledToBottom = jest.fn();

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue',
  () => ({
    useAtomComponentSelectorValue: () => mockIsScrolledToBottom(),
  }),
);

const scrollWrapperElement = document.createElement('div');
const messageListElement = document.createElement('div');

scrollWrapperElement.appendChild(messageListElement);

jest.mock('@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement', () => ({
  useScrollWrapperHTMLElement: () => ({
    getScrollWrapperElement: () => ({ scrollWrapperElement }),
  }),
}));

let notifyResize = () => {};

class MockResizeObserver {
  constructor(callback: () => void) {
    notifyResize = callback;
  }

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

const growMessageListTo = (scrollHeight: number) => {
  Object.defineProperty(scrollWrapperElement, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
  notifyResize();
};

describe('AgentChatStreamingAutoScrollEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    notifyResize = () => {};
    scrollWrapperElement.scrollTop = 0;
    global.ResizeObserver =
      MockResizeObserver as unknown as typeof ResizeObserver;
  });

  it('should keep the bottom in view while the answer grows', () => {
    mockIsScrolledToBottom.mockReturnValue(true);

    render(<AgentChatStreamingAutoScrollEffect />);
    growMessageListTo(480);

    expect(scrollWrapperElement.scrollTop).toBe(480);
  });

  it('should leave the scroll alone once the reader scrolled away', () => {
    mockIsScrolledToBottom.mockReturnValue(false);

    render(<AgentChatStreamingAutoScrollEffect />);
    growMessageListTo(480);

    expect(scrollWrapperElement.scrollTop).toBe(0);
  });
});
