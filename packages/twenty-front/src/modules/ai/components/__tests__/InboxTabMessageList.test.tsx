import { render } from '@testing-library/react';

import { InboxTabMessageList } from '@/ai/components/InboxTabMessageList';
import { INBOX_SURFACE } from '@/ai/constants/InboxSurface';
import { InboxSurfaceContext } from '@/ai/contexts/InboxSurfaceContext';
import { type InboxSurface } from '@/ai/types/InboxSurface';

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

jest.mock('@/ai/components/InboxNonLastMessageIdsList', () => ({
  InboxNonLastMessageIdsList: () => null,
}));
jest.mock('@/ai/components/InboxLastMessageWithStreamingState', () => ({
  InboxLastMessageWithStreamingState: () => null,
}));
jest.mock('@/ai/components/AiChatPendingResponseIndicator', () => ({
  AiChatPendingResponseIndicator: () => null,
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
jest.mock(
  '@/ai/components/InboxScrollToBottomOnDisplayedThreadChangeLayoutEffect',
  () => ({
    InboxScrollToBottomOnDisplayedThreadChangeLayoutEffect: () => null,
  }),
);
jest.mock('@/ai/components/AgentChatStreamingAutoScrollEffect', () => ({
  AgentChatStreamingAutoScrollEffect: () => null,
}));

describe('InboxTabMessageList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsWorkspaceSetupChat.mockReturnValue(false);
  });

  it('should render nothing with no messages and no preamble', () => {
    mockUseAtomStateValue.mockReturnValue(false);

    const { container } = render(<InboxTabMessageList />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render the preamble outside the scroll container with no messages', () => {
    mockUseAtomStateValue.mockReturnValue(false);

    mockUseIsWorkspaceSetupChat.mockReturnValue(true);

    const { getByTestId, queryByTestId } = render(<InboxTabMessageList />);

    expect(getByTestId('preamble')).toBeInTheDocument();
    expect(queryByTestId('scroll-wrapper')).not.toBeInTheDocument();
  });

  it('should render the preamble inside the message list once messages exist', () => {
    mockUseAtomStateValue.mockReturnValue(true);

    mockUseIsWorkspaceSetupChat.mockReturnValue(true);

    const { getByTestId } = render(<InboxTabMessageList />);

    expect(getByTestId('scroll-wrapper')).toContainElement(
      getByTestId('preamble'),
    );
  });

  it('should give each surface its own scroll wrapper instance id', () => {
    mockUseAtomStateValue.mockReturnValue(true);

    const renderForSurface = (surface: InboxSurface) =>
      render(
        <InboxSurfaceContext.Provider value={surface}>
          <InboxTabMessageList />
        </InboxSurfaceContext.Provider>,
      )
        .container.querySelector('[data-testid="scroll-wrapper"]')
        ?.getAttribute('data-component-instance-id');

    const pageInstanceId = renderForSurface(INBOX_SURFACE.PAGE);
    const sidePanelInstanceId = renderForSurface(INBOX_SURFACE.SIDE_PANEL);

    expect(pageInstanceId).not.toBe(sidePanelInstanceId);
  });
});
