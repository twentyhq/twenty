import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';

import { AiChatPageContinueInSidePanelEffect } from '@/ai/components/AiChatPageContinueInSidePanelEffect';
import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { SidePanelAskAiHandoffEffect } from '@/side-panel/components/SidePanelAskAiHandoffEffect';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const openAskAiPageMock = jest.fn();

jest.mock('@/side-panel/hooks/useOpenAskAiPageInSidePanel', () => ({
  useOpenAskAiPageInSidePanel: () => ({ openAskAiPage: openAskAiPageMock }),
}));

const onContinueChatFromFullWidthMock = jest.fn();

let navigateAwayFromChatPage: (() => void) | undefined;

const ChatPageRoute = () => {
  const navigate = useNavigate();

  navigateAwayFromChatPage = () => navigate('/objects/companies');

  return <AiChatPageContinueInSidePanelEffect />;
};

const RouterUnderTest = ({ initialPath }: { initialPath: string }) => (
  <JotaiProvider store={jotaiStore}>
    <MemoryRouter initialEntries={[initialPath]}>
      {/* The handoff lives in the persistent layout, outside the routes. */}
      <SidePanelAskAiHandoffEffect
        onContinueChatFromFullWidth={onContinueChatFromFullWidthMock}
      />
      <Routes>
        <Route path="/chat/:threadId?" element={<ChatPageRoute />} />
        <Route path="/objects/companies" element={<div />} />
      </Routes>
    </MemoryRouter>
  </JotaiProvider>
);

describe('SidePanelAskAiHandoffEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    resetJotaiStore();
    navigateAwayFromChatPage = undefined;
  });

  it('should continue the chat in the side panel on the navigation leaving the chat page', () => {
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);

    render(<RouterUnderTest initialPath="/chat" />);

    expect(jotaiStore.get(shouldContinueAiChatInSidePanelState.atom)).toBe(
      true,
    );
    expect(openAskAiPageMock).not.toHaveBeenCalled();

    act(() => {
      navigateAwayFromChatPage?.();
    });

    expect(openAskAiPageMock).toHaveBeenCalledWith({
      resetNavigationStack: true,
    });
    expect(onContinueChatFromFullWidthMock).toHaveBeenCalled();
    expect(jotaiStore.get(shouldContinueAiChatInSidePanelState.atom)).toBe(
      false,
    );
    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      false,
    );
  });

  it('should stay silent when the continuation marker was cleared before leaving', () => {
    render(<RouterUnderTest initialPath="/chat" />);

    act(() => {
      jotaiStore.set(shouldContinueAiChatInSidePanelState.atom, false);
      navigateAwayFromChatPage?.();
    });

    expect(openAskAiPageMock).not.toHaveBeenCalled();
    expect(onContinueChatFromFullWidthMock).not.toHaveBeenCalled();
  });

  it('should do nothing away from the chat page when the marker is not set', () => {
    render(<RouterUnderTest initialPath="/objects/companies" />);

    expect(openAskAiPageMock).not.toHaveBeenCalled();
    expect(onContinueChatFromFullWidthMock).not.toHaveBeenCalled();
  });
});
