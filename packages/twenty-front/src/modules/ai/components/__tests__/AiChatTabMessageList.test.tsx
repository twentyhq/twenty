import { act, fireEvent, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { AiChatTabMessageList } from '@/ai/components/AiChatTabMessageList';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('@/ai/components/AiChatNonLastMessageIdsList', () => ({
  AiChatNonLastMessageIdsList: () => (
    <div data-testid="non-last-messages" style={{ height: '5000px' }} />
  ),
}));

jest.mock('@/ai/components/AiChatLastMessageWithStreamingState', () => ({
  AiChatLastMessageWithStreamingState: () => (
    <div data-testid="last-message" style={{ height: '500px' }} />
  ),
}));

jest.mock('@/ai/components/AiChatErrorUnderMessageList', () => ({
  AiChatErrorUnderMessageList: () => null,
}));

jest.mock('@/ai/components/AiChatScrollToBottomButton', () => ({
  AiChatScrollToBottomButton: ({
    isVisible,
    onClick,
  }: {
    isVisible: boolean;
    onClick: () => void;
  }) => (
    <button
      data-testid="scroll-to-bottom"
      data-visible={isVisible}
      onClick={onClick}
    />
  ),
}));

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  callback: ResizeObserverCallback;
  observed: Element[] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  observe(target: Element) {
    this.observed.push(target);
  }

  disconnect() {
    this.observed = [];
  }

  unobserve() {}

  trigger() {
    this.callback(
      this.observed.map((target) => ({
        target,
        contentRect: target.getBoundingClientRect(),
      })) as ResizeObserverEntry[],
      this as unknown as ResizeObserver,
    );
  }
}

const setStubScrollDimensions = (
  element: HTMLElement,
  scrollHeight: number,
  clientHeight: number,
) => {
  Object.defineProperty(element, 'scrollHeight', {
    configurable: true,
    get: () => scrollHeight,
  });
  Object.defineProperty(element, 'clientHeight', {
    configurable: true,
    get: () => clientHeight,
  });
};

const renderMessageList = ({ threadId }: { threadId: string | null }) => {
  resetJotaiStore();
  jotaiStore.set(currentAiChatThreadState.atom, threadId);
  jotaiStore.set(agentChatDisplayedThreadState.atom, threadId);
  jotaiStore.set(
    agentChatMessagesComponentFamilyState.atomFamily({
      instanceId: 'agentChatComponentInstance',
      familyKey: { threadId },
    }),
    [
      {
        id: 'msg-1',
        role: 'user',
        parts: [{ type: 'text', text: 'hello' }],
      },
      {
        id: 'msg-2',
        role: 'assistant',
        parts: [{ type: 'text', text: 'world' }],
      },
    ] as never,
  );

  return render(
    <JotaiProvider store={jotaiStore}>
      <AgentChatComponentInstanceContext.Provider
        value={{ instanceId: 'agentChatComponentInstance' }}
      >
        <AiChatTabMessageList />
      </AgentChatComponentInstanceContext.Provider>
    </JotaiProvider>,
  );
};

describe('AiChatTabMessageList', () => {
  let originalResizeObserver: typeof globalThis.ResizeObserver;

  beforeEach(() => {
    MockResizeObserver.instances = [];
    originalResizeObserver = globalThis.ResizeObserver;
    globalThis.ResizeObserver =
      MockResizeObserver as unknown as typeof globalThis.ResizeObserver;
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
  });

  it('returns null when there are no messages', () => {
    resetJotaiStore();
    jotaiStore.set(currentAiChatThreadState.atom, null);
    jotaiStore.set(agentChatDisplayedThreadState.atom, null);

    const { container } = render(
      <JotaiProvider store={jotaiStore}>
        <AgentChatComponentInstanceContext.Provider
          value={{ instanceId: 'agentChatComponentInstance' }}
        >
          <AiChatTabMessageList />
        </AgentChatComponentInstanceContext.Provider>
      </JotaiProvider>,
    );

    expect(container.firstChild).toBeNull();
  });

  // Regression for fix #20413 — panel close+reopen creates a fresh scroll
  // wrapper at scrollTop=0; without the mount-scroll, users land at the top
  // of the conversation. Switching the active thread re-runs the same
  // mount-time layout effect.
  it('scrolls to the bottom when the active thread changes', () => {
    const { getByTestId } = renderMessageList({ threadId: 'thread-1' });

    const scrollContainer = getByTestId('non-last-messages').parentElement
      ?.parentElement as HTMLElement;
    setStubScrollDimensions(scrollContainer, 5500, 600);

    act(() => {
      jotaiStore.set(currentAiChatThreadState.atom, 'thread-2');
    });

    expect(scrollContainer.scrollTop).toBe(5500);
  });

  it('re-scrolls to the bottom when ResizeObserver fires while at-bottom', () => {
    const { getByTestId } = renderMessageList({ threadId: 'thread-1' });
    const scrollContainer = getByTestId('non-last-messages').parentElement
      ?.parentElement as HTMLElement;
    setStubScrollDimensions(scrollContainer, 5500, 600);

    act(() => {
      MockResizeObserver.instances[0]?.trigger();
    });

    expect(scrollContainer.scrollTop).toBe(5500);
  });

  it('stops auto-scrolling once the user scrolls away from the bottom', () => {
    const { getByTestId } = renderMessageList({ threadId: 'thread-1' });
    const scrollContainer = getByTestId('non-last-messages').parentElement
      ?.parentElement as HTMLElement;
    setStubScrollDimensions(scrollContainer, 5500, 600);

    act(() => {
      scrollContainer.scrollTop = 1000;
      fireEvent.scroll(scrollContainer);
    });

    setStubScrollDimensions(scrollContainer, 6000, 600);
    const latestObserver =
      MockResizeObserver.instances[MockResizeObserver.instances.length - 1];
    act(() => {
      latestObserver?.trigger();
    });

    expect(scrollContainer.scrollTop).toBe(1000);
  });

  it('shows the scroll-to-bottom button only when not at the bottom', () => {
    const { getByTestId } = renderMessageList({ threadId: 'thread-1' });
    const scrollContainer = getByTestId('non-last-messages').parentElement
      ?.parentElement as HTMLElement;
    setStubScrollDimensions(scrollContainer, 5500, 600);

    expect(getByTestId('scroll-to-bottom').dataset.visible).toBe('false');

    act(() => {
      scrollContainer.scrollTop = 100;
      fireEvent.scroll(scrollContainer);
    });

    expect(getByTestId('scroll-to-bottom').dataset.visible).toBe('true');
  });

  it('scrolls to the bottom when the scroll-to-bottom button is clicked', () => {
    const { getByTestId } = renderMessageList({ threadId: 'thread-1' });
    const scrollContainer = getByTestId('non-last-messages').parentElement
      ?.parentElement as HTMLElement;
    setStubScrollDimensions(scrollContainer, 5500, 600);

    act(() => {
      scrollContainer.scrollTop = 1000;
      fireEvent.scroll(scrollContainer);
    });

    act(() => {
      getByTestId('scroll-to-bottom').click();
    });

    expect(scrollContainer.scrollTop).toBe(5500);
  });
});
