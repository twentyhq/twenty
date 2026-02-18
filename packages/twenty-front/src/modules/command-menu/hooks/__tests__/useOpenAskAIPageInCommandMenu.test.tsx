import { renderHook, act } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { isCommandMenuOpenedStateV2 } from '@/command-menu/states/isCommandMenuOpenedStateV2';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
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
  <JotaiProvider store={jotaiStore}>
    <RecoilRoot>{children}</RecoilRoot>
  </JotaiProvider>
);

describe('useOpenAskAIPageInCommandMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jotaiStore.set(isCommandMenuOpenedStateV2.atom, false);
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
    jotaiStore.set(isCommandMenuOpenedStateV2.atom, true);

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
    jotaiStore.set(isCommandMenuOpenedStateV2.atom, true);

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
