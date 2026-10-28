import { fireEvent, render } from '@testing-library/react';

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
  isDisconnected = false;

  constructor(callback: () => void) {
    notifyResize = () => {
      if (!this.isDisconnected) {
        callback();
      }
    };
  }

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = () => {
    this.isDisconnected = true;
  };
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

  it('should stop following after a click in the chat until the reader is back at the bottom', () => {
    mockIsScrolledToBottom.mockReturnValue(true);

    render(<AgentChatStreamingAutoScrollEffect />);
    fireEvent.pointerDown(messageListElement);
    growMessageListTo(480);

    expect(scrollWrapperElement.scrollTop).toBe(0);

    scrollWrapperElement.scrollTop = 480;
    fireEvent.scroll(scrollWrapperElement);
    growMessageListTo(900);

    expect(scrollWrapperElement.scrollTop).toBe(900);
  });
});
