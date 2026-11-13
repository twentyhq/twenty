import { act, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import type * as React from 'react';
import { AiChatNonLastMessageIdsList } from '@/ai/components/AiChatNonLastMessageIdsList';
import { aiChatMessagesFamilyState } from '@/ai/states/aiChatMessagesFamilyState';

import { AiChatTabMessageList } from '@/ai/components/AiChatTabMessageList';
import { aiChatDisplayedThreadState } from '@/ai/states/aiChatDisplayedThreadState';
import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/aiChatIsAwaitingFirstChunkFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('@/ai/hooks/useIsWorkspaceSetupChat', () => ({
  useIsWorkspaceSetupChat: () => true,
}));

jest.mock('@/onboarding/components/WorkspaceSetupChatPreamble', () => ({
  WorkspaceSetupChatPreamble: () => <div data-testid="preamble" />,
}));

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
jest.mock('@/inbox/components/InboxThreadStatusNotice', () => ({
  InboxThreadStatusNotice: () => null,
}));
jest.mock('@/ai/components/AiChatErrorUnderMessageList', () => ({
  AiChatErrorUnderMessageList: () => null,
}));
jest.mock('@/ai/components/AiChatScrollToBottomButton', () => ({
  AiChatScrollToBottomButton: () => null,
}));
const mockPinScrollToBottom = jest.fn();

jest.mock(
  '@/ai/components/AiChatScrollToBottomOnDisplayedThreadChangeLayoutEffect',
  () => {
    const { useLayoutEffect } = jest.requireActual<typeof React>('react');
    return {
      AiChatScrollToBottomOnDisplayedThreadChangeLayoutEffect: () => {
        useLayoutEffect(mockPinScrollToBottom, []);
        return null;
      },
    };
  },
);
jest.mock('@/ai/components/AiChatStreamingAutoScrollEffect', () => ({
  AiChatStreamingAutoScrollEffect: () => null,
}));

jest.mock('@/ai/components/LazyMarkdownRenderer', () => ({
  MarkdownLoadingSkeleton: () => <div role="status">Loading conversation</div>,
}));

const THREAD_ID = 'thread-1';

const renderPreambleBranch = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <AiChatTabMessageList />
    </JotaiProvider>,
  );

describe('AiChatTabMessageList preamble branch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(aiChatDisplayedThreadState.atom, THREAD_ID);
  });

  it('should render the preamble with the pending response loader when the displayed thread is awaiting its first chunk', () => {
    jotaiStore.set(
      aiChatIsAwaitingFirstChunkFamilyState.atomFamily({
        threadId: THREAD_ID,
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
    jotaiStore.set(aiChatDisplayedThreadState.atom, THREAD_ID);
    jotaiStore.set(
      aiChatMessagesFamilyState.atomFamily({ threadId: THREAD_ID }),
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
