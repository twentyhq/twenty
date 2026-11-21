import { act, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { AiChatNonLastMessageIdsList } from '@/ai-chat/messages/components/AiChatNonLastMessageIdsList';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';

import { AiChatTabMessageList } from '@/ai-chat/messages/components/AiChatTabMessageList';
import { AiChatTestInstance } from '@/ai-chat/testing/AiChatTestInstance';
import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('@/ai-chat/hooks/useIsWorkspaceSetupChat', () => ({
  useIsWorkspaceSetupChat: () => true,
}));

jest.mock(
  '@/ai-chat/workspace-setup/components/WorkspaceSetupChatPreamble',
  () => ({
    WorkspaceSetupChatPreamble: () => <div data-testid="preamble" />,
  }),
);

jest.mock(
  '@/ai-chat/messages/components/AiChatInitialLoadingIndicator',
  () => ({
    AiChatInitialLoadingIndicator: () => (
      <div data-testid="initial-loading-indicator" />
    ),
  }),
);

jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({
    children,
    componentInstanceId,
  }: {
    children: ReactNode;
    componentInstanceId: string;
  }) => (
    <div
      data-testid="scroll-wrapper"
      id={`scroll-wrapper-${componentInstanceId}`}
    >
      {children}
    </div>
  ),
}));

jest.mock('@/ai-chat/messages/components/AiChatNonLastMessageIdsList', () => ({
  AiChatNonLastMessageIdsList: jest.fn(() => null),
}));
jest.mock(
  '@/ai-chat/messages/components/AiChatLastMessageWithStreamingState',
  () => ({
    AiChatLastMessageWithStreamingState: () => null,
  }),
);
jest.mock('@/ai-chat/threads/components/AiChatThreadStatusNotice', () => ({
  AiChatThreadStatusNotice: () => null,
}));
jest.mock('@/ai-chat/messages/components/AiChatErrorUnderMessageList', () => ({
  AiChatErrorUnderMessageList: () => null,
}));
jest.mock('@/ai-chat/messages/components/AiChatScrollToBottomButton', () => ({
  AiChatScrollToBottomButton: () => null,
}));
const mockPinScrollToBottom = jest.fn();

jest.mock('@/ai-chat/messages/utils/pinAiChatScrollToBottom', () => ({
  pinAiChatScrollToBottom: (...args: unknown[]) => {
    mockPinScrollToBottom(...args);

    return () => {};
  },
}));

jest.mock('@/ai-chat/message-content/components/LazyMarkdownRenderer', () => ({
  MarkdownLoadingSkeleton: () => <div role="status">Loading conversation</div>,
}));

const THREAD_ID = 'thread-1';

const renderPreambleBranch = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <AiChatTestInstance threadId={THREAD_ID}>
        <AiChatTabMessageList />
      </AiChatTestInstance>
    </JotaiProvider>,
  );

describe('AiChatTabMessageList preamble branch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
  });

  it('should render the preamble with the pending response loader when the displayed thread is awaiting its first chunk', () => {
    jotaiStore.set(
      aiChatThreadReplyStatusFamilyState.atomFamily({
        threadId: THREAD_ID,
      }),
      'awaiting-first-chunk',
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
    jotaiStore.set(
      aiChatThreadDisplayedMessagesFamilyState.atomFamily({
        threadId: THREAD_ID,
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
