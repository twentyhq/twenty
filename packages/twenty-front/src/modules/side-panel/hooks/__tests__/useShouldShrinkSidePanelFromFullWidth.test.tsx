import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { useShouldShrinkSidePanelFromFullWidth } from '@/side-panel/hooks/useShouldShrinkSidePanelFromFullWidth';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const useReducedMotionMock = jest.fn();

jest.mock('framer-motion', () => ({
  useReducedMotion: () => useReducedMotionMock(),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useShouldShrinkSidePanelFromFullWidth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    useReducedMotionMock.mockReturnValue(false);
  });

  it('should shrink from full width when arriving from the workspace setup page', () => {
    jotaiStore.set(shouldContinueAiChatInSidePanelState.atom, true);

    const { result } = renderHook(
      () => useShouldShrinkSidePanelFromFullWidth(),
      { wrapper: Wrapper },
    );

    expect(result.current).toBe(true);
  });

  it('should keep the marker untouched so the handoff effect can consume it', () => {
    jotaiStore.set(shouldContinueAiChatInSidePanelState.atom, true);

    renderHook(() => useShouldShrinkSidePanelFromFullWidth(), {
      wrapper: Wrapper,
    });

    expect(jotaiStore.get(shouldContinueAiChatInSidePanelState.atom)).toBe(
      true,
    );
  });

  it('should not shrink from full width when not arriving from the workspace setup page', () => {
    const { result } = renderHook(
      () => useShouldShrinkSidePanelFromFullWidth(),
      { wrapper: Wrapper },
    );

    expect(result.current).toBe(false);
  });

  it('should not shrink from full width when reduced motion is preferred', () => {
    useReducedMotionMock.mockReturnValue(true);
    jotaiStore.set(shouldContinueAiChatInSidePanelState.atom, true);

    const { result } = renderHook(
      () => useShouldShrinkSidePanelFromFullWidth(),
      { wrapper: Wrapper },
    );

    expect(result.current).toBe(false);
  });
});
