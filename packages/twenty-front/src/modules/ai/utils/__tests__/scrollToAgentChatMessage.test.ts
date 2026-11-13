import { scrollToAiChatMessage } from '@/ai/utils/scrollToAgentChatMessage';

const renderMessageRow = () => {
  const messageRow = document.createElement('div');

  messageRow.dataset.agentChatMessageId = 'original';
  messageRow.scrollIntoView = jest.fn();
  messageRow.animate = jest.fn();
  document.body.appendChild(messageRow);

  return messageRow;
};

const setPrefersReducedMotion = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({ matches }),
  });
};

describe('scrollToAiChatMessage', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('scrolls smoothly to the message and flashes it once scrolling stops', () => {
    setPrefersReducedMotion(false);
    const messageRow = renderMessageRow();

    scrollToAiChatMessage('original');

    expect(messageRow.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });

    jest.advanceTimersByTime(100);
    document.dispatchEvent(new Event('scroll'));
    jest.advanceTimersByTime(100);
    expect(messageRow.animate).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(messageRow.animate).toHaveBeenCalledTimes(1);
  });

  it('jumps to the message without a flash when motion is reduced', () => {
    setPrefersReducedMotion(true);
    const messageRow = renderMessageRow();

    scrollToAiChatMessage('original');
    jest.runAllTimers();

    expect(messageRow.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'center',
    });
    expect(messageRow.animate).not.toHaveBeenCalled();
  });
});
