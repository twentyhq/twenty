import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { aiChatExpandedReturnLocationState } from '@/ai/states/aiChatExpandedReturnLocationState';
import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useAskAiHandoffFromWorkspaceSetup } from '@/side-panel/hooks/useAskAiHandoffFromWorkspaceSetup';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const openAskAiPageMock = jest.fn();

jest.mock('@/side-panel/hooks/useOpenAskAiPageInSidePanel', () => ({
  useOpenAskAiPageInSidePanel: () => ({ openAskAiPage: openAskAiPageMock }),
}));

const useReducedMotionMock = jest.fn();

jest.mock('framer-motion', () => ({
  useReducedMotion: () => useReducedMotionMock(),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useAskAiHandoffFromWorkspaceSetup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    resetJotaiStore();
    useReducedMotionMock.mockReturnValue(false);
  });

  it('should open the ask ai page and shrink from full width when arriving from the workspace setup page', () => {
    jotaiStore.set(shouldContinueAiChatInSidePanelState.atom, true);
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);
    jotaiStore.set(aiChatExpandedReturnLocationState.atom, '/objects/people');

    const { result } = renderHook(() => useAskAiHandoffFromWorkspaceSetup(), {
      wrapper: Wrapper,
    });

    expect(openAskAiPageMock).toHaveBeenCalledWith({
      resetNavigationStack: true,
    });
    expect(jotaiStore.get(shouldContinueAiChatInSidePanelState.atom)).toBe(
      false,
    );
    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      false,
    );
    expect(jotaiStore.get(aiChatExpandedReturnLocationState.atom)).toBeNull();
    expect(result.current.shouldShrinkFromFullWidth).toBe(true);
  });

  it('should do nothing when not arriving from the workspace setup page', () => {
    const { result } = renderHook(() => useAskAiHandoffFromWorkspaceSetup(), {
      wrapper: Wrapper,
    });

    expect(openAskAiPageMock).not.toHaveBeenCalled();
    expect(result.current.shouldShrinkFromFullWidth).toBe(false);
  });

  it('should open the ask ai page without shrinking from full width when reduced motion is preferred', () => {
    useReducedMotionMock.mockReturnValue(true);
    jotaiStore.set(shouldContinueAiChatInSidePanelState.atom, true);

    const { result } = renderHook(() => useAskAiHandoffFromWorkspaceSetup(), {
      wrapper: Wrapper,
    });

    expect(openAskAiPageMock).toHaveBeenCalledWith({
      resetNavigationStack: true,
    });
    expect(result.current.shouldShrinkFromFullWidth).toBe(false);
  });
});
