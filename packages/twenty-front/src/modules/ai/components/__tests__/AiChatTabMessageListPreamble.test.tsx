import { act, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import type * as React from 'react';
import { AiChatNonLastMessageIdsList } from '@/ai/components/AiChatNonLastMessageIdsList';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';

import { AiChatTabMessageList } from '@/ai/components/AiChatTabMessageList';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { AiChatMessageListPreambleContext } from '@/ai/contexts/AiChatMessageListPreambleContext';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatIsAwaitingFirstChunkComponentFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkComponentFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('@/ai/components/AiChatInitialLoadingIndicator', () => ({
  AiChatInitialLoadingIndicator: () => (
    <div data-testid="initial-loading-indicator" />
  ),
}));

jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({ children }: { children: ReactNode }) => (
    <div data-testid="scroll-wrapper">{children}</div>
  ),
}));

jest.mock('@/ai/components/AiChatNonLastMessageIdsList', () => ({
  AiChatNonLastMessageIdsList: jest.fn(() => null),
}));
jest.mock('@/ai/components/AiChatLastMessageWithStreamingState', () => ({
  AiChatLastMessageWithStreamingState: () => null,
}));
jest.mock('@/ai/components/AiChatErrorUnderMessageList', () => ({
  AiChatErrorUnderMessageList: () => null,
}));
jest.mock('@/ai/components/AiChatScrollToBottomButton', () => ({
  AiChatScrollToBottomButton: () => null,
}));
const mockPinScrollToBottom = jest.fn();

jest.mock(
  '@/ai/components/AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect',
  () => {
    const { useLayoutEffect } = jest.requireActual<typeof React>('react');
    return {
      AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect: () => {
        useLayoutEffect(mockPinScrollToBottom, []);
        return null;
      },
    };
  },
);
jest.mock('@/ai/components/AgentChatStreamingAutoScrollEffect', () => ({
  AgentChatStreamingAutoScrollEffect: () => null,
}));

jest.mock('@/ai/components/LazyMarkdownRenderer', () => ({
  MarkdownLoadingSkeleton: () => <div role="status">Loading conversation</div>,
}));

const INSTANCE_ID = 'aiChatTabMessageListPreambleTest';
const THREAD_ID = 'thread-1';

const renderPreambleBranch = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <AgentChatComponentInstanceContext.Provider
        value={{ instanceId: INSTANCE_ID }}
      >
        <AiChatMessageListPreambleContext.Provider
          value={<div data-testid="preamble" />}
        >
          <AiChatTabMessageList />
        </AiChatMessageListPreambleContext.Provider>
      </AgentChatComponentInstanceContext.Provider>
    </JotaiProvider>,
  );

describe('AiChatTabMessageList preamble branch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
  });

  it('should render the preamble with the pending response loader when the displayed thread is awaiting its first chunk', () => {
    jotaiStore.set(
      agentChatIsAwaitingFirstChunkComponentFamilyState.atomFamily({
        instanceId: INSTANCE_ID,
        familyKey: { threadId: THREAD_ID },
      }),
      true,
    );

    const { getByTestId, queryByTestId } = renderPreambleBranch();

    expect(getByTestId('preamble')).toBeInTheDocument();
    expect(getByTestId('initial-loading-indicator')).toBeInTheDocument();
    expect(queryByTestId('scroll-wrapper')).not.toBeInTheDocument();
  });

  it('should render the preamble without the pending response loader when the displayed thread is not awaiting its first chunk', () => {
    const { getByTestId, queryByTestId } = renderPreambleBranch();

    expect(getByTestId('preamble')).toBeInTheDocument();
    expect(queryByTestId('initial-loading-indicator')).not.toBeInTheDocument();
  });
});

describe('AiChatTabMessageList loading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
    jotaiStore.set(
      agentChatMessagesComponentFamilyState.atomFamily({
        instanceId: INSTANCE_ID,
        familyKey: { threadId: THREAD_ID },
      }),
      [{ id: 'message-1', role: 'user', parts: [] }],
    );
  });

  it('shows one placeholder and waits for message content before positioning the conversation', async () => {
    let finishLoading = () => {};
    let isLoaded = false;
    const loading = new Promise<void>((resolve) => {
      finishLoading = resolve;
    });

    jest.mocked(AiChatNonLastMessageIdsList).mockImplementation(() => {
      if (!isLoaded) {
        throw loading;
      }
      return Array.from({ length: 16 }, (_, index) => (
        <div key={index}>Message {index + 1}</div>
      ));
    });

    renderPreambleBranch();

    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
    expect(mockPinScrollToBottom).not.toHaveBeenCalled();

    await act(async () => {
      isLoaded = true;
      finishLoading();
      await loading;
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getAllByText(/^Message /)).toHaveLength(16);
    expect(mockPinScrollToBottom).toHaveBeenCalled();
  });
});
