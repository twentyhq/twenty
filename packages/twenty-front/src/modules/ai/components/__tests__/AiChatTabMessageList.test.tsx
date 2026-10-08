import { render } from '@testing-library/react';

import { AiChatTabMessageList } from '@/ai/components/AiChatTabMessageList';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { type AiChatSurface } from '@/ai/types/AiChatSurface';

const mockUseAtomStateValue = jest.fn();
const mockUseIsWorkspaceSetupChat = jest.fn(() => false);

jest.mock('@/ai/hooks/useIsWorkspaceSetupChat', () => ({
  useIsWorkspaceSetupChat: () => mockUseIsWorkspaceSetupChat(),
}));

jest.mock('@/onboarding/components/WorkspaceSetupChatPreamble', () => ({
  WorkspaceSetupChatPreamble: () => <div data-testid="preamble" />,
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => mockUseAtomStateValue(),
}));

jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({
    children,
    componentInstanceId,
  }: {
    children: React.ReactNode;
    componentInstanceId: string;
  }) => (
    <div
      data-testid="scroll-wrapper"
      data-component-instance-id={componentInstanceId}
    >
      {children}
    </div>
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
jest.mock('@/ai/components/AiChatThreadInboxStateNotice', () => ({
  AiChatThreadInboxStateNotice: () => null,
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
jest.mock('@/ai/components/AgentChatStreamingAutoScrollEffect', () => ({
  AgentChatStreamingAutoScrollEffect: () => null,
}));

describe('AiChatTabMessageList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsWorkspaceSetupChat.mockReturnValue(false);
  });

  it('should render nothing with no messages and no preamble', () => {
    mockUseAtomStateValue.mockReturnValue(false);

    const { container } = render(<AiChatTabMessageList />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render the preamble outside the scroll container with no messages', () => {
    mockUseAtomStateValue.mockReturnValue(false);

    mockUseIsWorkspaceSetupChat.mockReturnValue(true);

    const { getByTestId, queryByTestId } = render(<AiChatTabMessageList />);

    expect(getByTestId('preamble')).toBeInTheDocument();
    expect(queryByTestId('scroll-wrapper')).not.toBeInTheDocument();
  });

  it('should render the preamble inside the message list once messages exist', () => {
    mockUseAtomStateValue.mockReturnValue(true);

    mockUseIsWorkspaceSetupChat.mockReturnValue(true);

    const { getByTestId } = render(<AiChatTabMessageList />);

    expect(getByTestId('scroll-wrapper')).toContainElement(
      getByTestId('preamble'),
    );
  });

  it('should give each surface its own scroll wrapper instance id', () => {
    mockUseAtomStateValue.mockReturnValue(true);

    const renderForSurface = (surface: AiChatSurface) =>
      render(
        <AiChatSurfaceContext.Provider value={surface}>
          <AiChatTabMessageList />
        </AiChatSurfaceContext.Provider>,
      )
        .container.querySelector('[data-testid="scroll-wrapper"]')
        ?.getAttribute('data-component-instance-id');

    const pageInstanceId = renderForSurface(AI_CHAT_SURFACE.PAGE);
    const sidePanelInstanceId = renderForSurface(AI_CHAT_SURFACE.SIDE_PANEL);

    expect(pageInstanceId).not.toBe(sidePanelInstanceId);
  });
});
