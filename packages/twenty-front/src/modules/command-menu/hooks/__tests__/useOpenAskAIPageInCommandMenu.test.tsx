import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { CommandMenuPages } from 'twenty-shared/types';
import { IconSparkles } from 'twenty-ui/display';

const navigateCommandMenuMock = jest.fn();

jest.mock('@/command-menu/hooks/useCommandMenu', () => ({
  useCommandMenu: () => ({
    navigateCommandMenu: navigateCommandMenuMock,
    openCommandMenu: jest.fn(),
    closeCommandMenu: jest.fn(),
    toggleCommandMenu: jest.fn(),
  }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useOpenAskAIPageInCommandMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jotaiStore.set(isCommandMenuOpenedState.atom, false);
  });

  it('should navigate to AskAI page with correct defaults', () => {
    const { result } = renderHook(() => useOpenAskAIPageInCommandMenu(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAIPage();
    });

    expect(navigateCommandMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: CommandMenuPages.AskAI,
        pageTitle: 'Ask AI',
        pageIcon: IconSparkles,
      }),
    );
  });

  it('should use resetNavigationStack from argument when provided', () => {
    jotaiStore.set(isCommandMenuOpenedState.atom, true);

    const { result } = renderHook(() => useOpenAskAIPageInCommandMenu(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAIPage({ resetNavigationStack: false });
    });

    expect(navigateCommandMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resetNavigationStack: false,
      }),
    );
  });

  it('should default resetNavigationStack to isCommandMenuOpened', () => {
    jotaiStore.set(isCommandMenuOpenedState.atom, true);

    const { result } = renderHook(() => useOpenAskAIPageInCommandMenu(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAIPage();
    });

    expect(navigateCommandMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resetNavigationStack: true,
      }),
    );
  });
});
