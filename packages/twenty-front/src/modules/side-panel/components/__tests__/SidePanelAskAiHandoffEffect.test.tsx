import { act, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';

import { AiChatPageContinueInSidePanelEffect } from '@/ai/components/AiChatPageContinueInSidePanelEffect';
import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { WorkspaceSetupChatSidePanelEffect } from '@/onboarding/effect-components/WorkspaceSetupChatSidePanelEffect';
import { SidePanelAskAiHandoffEffect } from '@/side-panel/components/SidePanelAskAiHandoffEffect';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

let defaultHomePagePath = '/objects/companies';
jest.mock('@/navigation/hooks/useDefaultHomePagePath', () => ({
  useDefaultHomePagePath: () => ({ defaultHomePagePath }),
}));

const openAskAiPageMock = jest.fn();

jest.mock('@/side-panel/hooks/useOpenAskAiPageInSidePanel', () => ({
  useOpenAskAiPageInSidePanel: () => ({ openAskAiPage: openAskAiPageMock }),
}));

const onContinueChatFromFullWidthMock = jest.fn();

let navigateAwayFromChatPage: ((pathname?: string) => void) | undefined;

const ChatPageRoute = () => {
  const navigate = useNavigate();

  navigateAwayFromChatPage = (pathname = '/objects/companies') =>
    navigate(pathname);

  return (
    <>
      <AiChatPageContinueInSidePanelEffect />
      <div>Setup conversation</div>
    </>
  );
};

const RouterUnderTest = ({ initialPath }: { initialPath: string }) => (
  <JotaiProvider store={jotaiStore}>
    <MemoryRouter initialEntries={[initialPath]}>
      {/* The handoff lives in the persistent layout, outside the routes. */}
      <WorkspaceSetupChatSidePanelEffect />
      <SidePanelAskAiHandoffEffect
        onContinueChatFromFullWidth={onContinueChatFromFullWidthMock}
      />
      <Routes>
        <Route path="/chat/:threadId?" element={<ChatPageRoute />} />
        <Route
          path="/objects/companies"
          element={<div>Companies homepage</div>}
        />
        <Route path="/settings/*" element={<div />} />
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
    defaultHomePagePath = '/objects/companies';
  });

  it('opens setup on the homepage after returning to settings', () => {
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);
    render(<RouterUnderTest initialPath="/settings/profile" />);
    expect(screen.getByText('Companies homepage')).toBeInTheDocument();
    expect(openAskAiPageMock).toHaveBeenCalledTimes(1);
  });

  it('uses the chat page when no readable object homepage exists', () => {
    defaultHomePagePath = '/settings/profile';
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);
    render(<RouterUnderTest initialPath="/settings/profile" />);
    expect(screen.getByText('Setup conversation')).toBeInTheDocument();
    expect(openAskAiPageMock).not.toHaveBeenCalled();
    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      true,
    );
  });

  it('preserves dismissal across remounts but opens again after an application reload', () => {
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);
    const first = render(<RouterUnderTest initialPath="/objects/companies" />);
    first.unmount();
    const second = render(<RouterUnderTest initialPath="/objects/companies" />);
    expect(openAskAiPageMock).toHaveBeenCalledTimes(1);
    second.unmount();
    resetJotaiStore();
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);
    render(<RouterUnderTest initialPath="/objects/companies" />);
    expect(openAskAiPageMock).toHaveBeenCalledTimes(2);
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

    expect(openAskAiPageMock).toHaveBeenCalledTimes(1);
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

  it.each(['/chat', '/chat/existing-thread'])(
    'does not move the chat from %s into the side panel when opening settings or leaving them',
    (initialPath) => {
      jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);

      render(<RouterUnderTest initialPath={initialPath} />);

      act(() => navigateAwayFromChatPage?.('/settings/profile'));

      expect(openAskAiPageMock).not.toHaveBeenCalled();
      expect(onContinueChatFromFullWidthMock).not.toHaveBeenCalled();
      expect(jotaiStore.get(shouldContinueAiChatInSidePanelState.atom)).toBe(
        false,
      );
      expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
        false,
      );

      act(() => navigateAwayFromChatPage?.());

      expect(openAskAiPageMock).not.toHaveBeenCalled();
      expect(onContinueChatFromFullWidthMock).not.toHaveBeenCalled();
    },
  );

  it('should do nothing away from the chat page when the marker is not set', () => {
    render(<RouterUnderTest initialPath="/objects/companies" />);

    expect(openAskAiPageMock).not.toHaveBeenCalled();
    expect(onContinueChatFromFullWidthMock).not.toHaveBeenCalled();
  });
});
