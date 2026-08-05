import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useReturnFromExpandedAiChat } from '@/ai/hooks/useReturnFromExpandedAiChat';
import { aiChatExpandedReturnLocationState } from '@/ai/states/aiChatExpandedReturnLocationState';
import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const navigateMock = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

const defaultHomePagePath = '/objects/companies';

jest.mock('@/navigation/hooks/useDefaultHomePagePath', () => ({
  useDefaultHomePagePath: () => ({ defaultHomePagePath }),
}));

const openAskAiPageMock = jest.fn();

jest.mock('@/side-panel/hooks/useOpenAskAiPageInSidePanel', () => ({
  useOpenAskAiPageInSidePanel: () => ({ openAskAiPage: openAskAiPageMock }),
}));

const closeSidePanelMenuMock = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: closeSidePanelMenuMock }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useReturnFromExpandedAiChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    resetJotaiStore();
  });

  it('should reopen the side panel and keep the side panel continuation when collapsing', () => {
    jotaiStore.set(shouldContinueAiChatInSidePanelState.atom, true);
    jotaiStore.set(aiChatExpandedReturnLocationState.atom, '/objects/people');

    const { result } = renderHook(
      () => useReturnFromExpandedAiChat({ reopenSidePanel: true }),
      { wrapper: Wrapper },
    );

    act(() => {
      result.current();
    });

    expect(openAskAiPageMock).toHaveBeenCalledWith({
      resetNavigationStack: true,
    });
    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/objects/people');
    expect(jotaiStore.get(shouldContinueAiChatInSidePanelState.atom)).toBe(
      true,
    );
    expect(jotaiStore.get(aiChatExpandedReturnLocationState.atom)).toBeNull();
    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      false,
    );
  });

  it('should cancel the side panel continuation when closing', () => {
    jotaiStore.set(shouldContinueAiChatInSidePanelState.atom, true);

    const { result } = renderHook(
      () => useReturnFromExpandedAiChat({ reopenSidePanel: false }),
      { wrapper: Wrapper },
    );

    act(() => {
      result.current();
    });

    expect(openAskAiPageMock).not.toHaveBeenCalled();
    expect(closeSidePanelMenuMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith(defaultHomePagePath);
    expect(jotaiStore.get(shouldContinueAiChatInSidePanelState.atom)).toBe(
      false,
    );
  });
});
