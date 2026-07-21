import { render } from '@testing-library/react';

import { AiChatTabMessageList } from '@/ai/components/AiChatTabMessageList';

const mockUseAtomComponentSelectorValue = jest.fn();

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue',
  () => ({
    useAtomComponentSelectorValue: () => mockUseAtomComponentSelectorValue(),
  }),
);

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => false,
}));

jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scroll-wrapper">{children}</div>
  ),
}));

jest.mock('@/ai/components/AiChatNonLastMessageIdsList', () => ({
  AiChatNonLastMessageIdsList: () => null,
}));
jest.mock('@/ai/components/AiChatLastMessageWithStreamingState', () => ({
  AiChatLastMessageWithStreamingState: () => null,
}));
jest.mock('@/ai/components/AiChatPendingResponseIndicator', () => ({
  AiChatPendingResponseIndicator: () => null,
}));
jest.mock('@/ai/components/AiChatErrorUnderMessageList', () => ({
  AiChatErrorUnderMessageList: () => null,
}));
jest.mock('@/ai/components/AiChatScrollToBottomButton', () => ({
  AiChatScrollToBottomButton: () => null,
}));
jest.mock(
  '@/ai/components/AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect',
  () => ({
    AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect: () => null,
  }),
);
jest.mock('@/ai/components/AgentChatScrollToBottomOnMountLayoutEffect', () => ({
  AgentChatScrollToBottomOnMountLayoutEffect: () => null,
}));

describe('AiChatTabMessageList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render nothing with no messages and no preamble', () => {
    mockUseAtomComponentSelectorValue.mockReturnValue(false);

    const { container } = render(<AiChatTabMessageList />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render the preamble outside the scroll container with no messages', () => {
    mockUseAtomComponentSelectorValue.mockReturnValue(false);

    const { getByTestId, queryByTestId } = render(
      <AiChatTabMessageList
        messageListPreamble={<div data-testid="preamble" />}
      />,
    );

    expect(getByTestId('preamble')).toBeInTheDocument();
    expect(queryByTestId('scroll-wrapper')).not.toBeInTheDocument();
  });

  it('should render the preamble inside the message list once messages exist', () => {
    mockUseAtomComponentSelectorValue.mockReturnValue(true);

    const { getByTestId } = render(
      <AiChatTabMessageList
        messageListPreamble={<div data-testid="preamble" />}
      />,
    );

    expect(getByTestId('scroll-wrapper')).toContainElement(
      getByTestId('preamble'),
    );
  });
});
