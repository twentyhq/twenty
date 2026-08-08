import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useReturnFromExpandedAiChat } from '@/ai/hooks/useReturnFromExpandedAiChat';
import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const navigateMock = jest.fn();

let locationState: unknown = null;

jest.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  useLocation: () => ({ state: locationState }),
}));

const defaultHomePagePath = '/objects/companies';

jest.mock('@/navigation/hooks/useDefaultHomePagePath', () => ({
  useDefaultHomePagePath: () => ({ defaultHomePagePath }),
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
    locationState = null;
  });

  it('should navigate to the return location carried by the history entry when collapsing', () => {
    jotaiStore.set(shouldContinueAiChatInSidePanelState.atom, true);
    locationState = { returnLocation: '/objects/people' };

    const { result } = renderHook(
      () => useReturnFromExpandedAiChat({ reopenSidePanel: true }),
      { wrapper: Wrapper },
    );

    act(() => {
      result.current();
    });

    expect(navigateMock).toHaveBeenCalledWith('/objects/people');
    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
    // The side panel handoff consumes the marker on the navigation itself.
    expect(jotaiStore.get(shouldContinueAiChatInSidePanelState.atom)).toBe(
      true,
    );
  });

  it('should navigate home when the history entry has no return location', () => {
    const { result } = renderHook(
      () => useReturnFromExpandedAiChat({ reopenSidePanel: true }),
      { wrapper: Wrapper },
    );

    act(() => {
      result.current();
    });

    expect(navigateMock).toHaveBeenCalledWith(defaultHomePagePath);
  });

  it('should cancel the side panel continuation when closing', () => {
    jotaiStore.set(shouldContinueAiChatInSidePanelState.atom, true);
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);

    const { result } = renderHook(
      () => useReturnFromExpandedAiChat({ reopenSidePanel: false }),
      { wrapper: Wrapper },
    );

    act(() => {
      result.current();
    });

    expect(jotaiStore.get(shouldContinueAiChatInSidePanelState.atom)).toBe(
      false,
    );
    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      false,
    );
    expect(closeSidePanelMenuMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith(defaultHomePagePath);
  });
});
