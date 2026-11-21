import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useReturnFromExpandedAiChat } from '@/ai-chat/hooks/useReturnFromExpandedAiChat';
import { aiChatContinueInSidePanelThreadIdState } from '@/ai-chat/states/aiChatContinueInSidePanelThreadIdState';
import { shouldOpenAiChatAfterOnboardingState } from '@/ai-chat/states/shouldOpenAiChatAfterOnboardingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const CONTINUED_THREAD_ID = '20202020-0000-4000-8000-000000000002';

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
    jotaiStore.set(
      aiChatContinueInSidePanelThreadIdState.atom,
      CONTINUED_THREAD_ID,
    );
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
    expect(jotaiStore.get(aiChatContinueInSidePanelThreadIdState.atom)).toBe(
      CONTINUED_THREAD_ID,
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

  it('should prefer the destination path over the return location carried by the history entry', () => {
    locationState = { returnLocation: '/objects/people' };

    const { result } = renderHook(
      () =>
        useReturnFromExpandedAiChat({
          reopenSidePanel: true,
          destinationPath: '/objects/opportunities',
        }),
      { wrapper: Wrapper },
    );

    act(() => {
      result.current();
    });

    expect(navigateMock).toHaveBeenCalledWith('/objects/opportunities');
  });

  it('should cancel the side panel continuation when closing', () => {
    jotaiStore.set(
      aiChatContinueInSidePanelThreadIdState.atom,
      CONTINUED_THREAD_ID,
    );
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);

    const { result } = renderHook(
      () => useReturnFromExpandedAiChat({ reopenSidePanel: false }),
      { wrapper: Wrapper },
    );

    act(() => {
      result.current();
    });

    expect(
      jotaiStore.get(aiChatContinueInSidePanelThreadIdState.atom),
    ).toBeNull();
    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      false,
    );
    expect(closeSidePanelMenuMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith(defaultHomePagePath);
  });
});
