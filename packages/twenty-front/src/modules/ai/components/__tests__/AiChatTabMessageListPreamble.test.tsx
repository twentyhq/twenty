import { act, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import type * as React from 'react';
import { InboxNonLastMessageIdsList } from '@/ai/components/InboxNonLastMessageIdsList';
import { inboxMessagesFamilyState } from '@/ai/states/inboxMessagesFamilyState';

import { InboxTabMessageList } from '@/ai/components/InboxTabMessageList';
import { inboxDisplayedThreadState } from '@/ai/states/inboxDisplayedThreadState';
import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
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

jest.mock('@/ai/components/InboxInitialLoadingIndicator', () => ({
  InboxInitialLoadingIndicator: () => (
    <div data-testid="initial-loading-indicator" />
  ),
}));

jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({ children }: { children: ReactNode }) => (
    <div data-testid="scroll-wrapper">{children}</div>
  ),
}));

jest.mock('@/ai/components/InboxNonLastMessageIdsList', () => ({
  InboxNonLastMessageIdsList: jest.fn(() => null),
}));
jest.mock('@/ai/components/InboxLastMessageWithStreamingState', () => ({
  InboxLastMessageWithStreamingState: () => null,
}));
jest.mock('@/ai/components/InboxThreadStatusNotice', () => ({
  InboxThreadStatusNotice: () => null,
}));
jest.mock('@/ai/components/AiChatErrorUnderMessageList', () => ({
  AiChatErrorUnderMessageList: () => null,
}));
jest.mock('@/ai/components/InboxScrollToBottomButton', () => ({
  InboxScrollToBottomButton: () => null,
}));
const mockPinScrollToBottom = jest.fn();

jest.mock(
  '@/ai/components/InboxScrollToBottomOnDisplayedThreadChangeLayoutEffect',
  () => {
    const { useLayoutEffect } = jest.requireActual<typeof React>('react');
    return {
      InboxScrollToBottomOnDisplayedThreadChangeLayoutEffect: () => {
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

const THREAD_ID = 'thread-1';

const renderPreambleBranch = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <InboxTabMessageList />
    </JotaiProvider>,
  );

describe('InboxTabMessageList preamble branch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(inboxDisplayedThreadState.atom, THREAD_ID);
  });

  it('should render the preamble with the pending response loader when the displayed thread is awaiting its first chunk', () => {
    jotaiStore.set(
      agentChatIsAwaitingFirstChunkFamilyState.atomFamily({
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

describe('InboxTabMessageList loading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(inboxDisplayedThreadState.atom, THREAD_ID);
    jotaiStore.set(
      inboxMessagesFamilyState.atomFamily({ threadId: THREAD_ID }),
      [{ id: 'message-1', role: 'user', parts: [] }],
    );
  });

  it('shows one placeholder and waits for message content before positioning the conversation', async () => {
    let finishLoading = () => {};
    let isLoaded = false;
    const loading = new Promise<void>((resolve) => {
      finishLoading = resolve;
    });

    jest.mocked(InboxNonLastMessageIdsList).mockImplementation(() => {
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
