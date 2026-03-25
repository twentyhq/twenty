import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useOpenAskAIPageInSidePanel } from '@/side-panel/hooks/useOpenAskAIPageInSidePanel';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SidePanelPages } from 'twenty-shared/types';
import { IconSparkles } from 'twenty-ui/display';

const navigateSidePanelMenuMock = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    navigateSidePanelMenu: navigateSidePanelMenuMock,
    openSidePanelMenu: jest.fn(),
    closeSidePanelMenu: jest.fn(),
    toggleSidePanelMenu: jest.fn(),
  }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useOpenAskAIPageInSidePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jotaiStore.set(isSidePanelOpenedState.atom, false);
  });

  it('should navigate to AskAI page with correct defaults', () => {
    const { result } = renderHook(() => useOpenAskAIPageInSidePanel(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAIPage();
    });

    expect(navigateSidePanelMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: SidePanelPages.AskAI,
        pageTitle: 'Ask AI',
        pageIcon: IconSparkles,
      }),
    );
  });

  it('should use resetNavigationStack from argument when provided', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);

    const { result } = renderHook(() => useOpenAskAIPageInSidePanel(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAIPage({ resetNavigationStack: false });
    });

    expect(navigateSidePanelMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resetNavigationStack: false,
      }),
    );
  });

  it('should default resetNavigationStack to isSidePanelOpened', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);

    const { result } = renderHook(() => useOpenAskAIPageInSidePanel(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAIPage();
    });

    expect(navigateSidePanelMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resetNavigationStack: true,
      }),
    );
  });
});
