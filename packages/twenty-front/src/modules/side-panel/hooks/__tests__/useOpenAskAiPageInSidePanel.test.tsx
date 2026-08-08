import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SidePanelPages } from 'twenty-shared/types';
import { IconSparkles } from 'twenty-ui/icon';

const navigateSidePanelMenuMock = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    navigateSidePanelMenu: navigateSidePanelMenuMock,
    openSidePanelMenu: jest.fn(),
    closeSidePanelMenu: jest.fn(),
    toggleSidePanelMenu: jest.fn(),
  }),
}));

const createWrapper =
  (initialPath: string) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
    </JotaiProvider>
  );

const Wrapper = createWrapper('/objects/companies');

describe('useOpenAskAiPageInSidePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jotaiStore.set(isSidePanelOpenedState.atom, false);
  });

  it('should navigate to AskAI page with correct defaults', () => {
    const { result } = renderHook(() => useOpenAskAiPageInSidePanel(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAiPage();
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

    const { result } = renderHook(() => useOpenAskAiPageInSidePanel(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAiPage({ resetNavigationStack: false });
    });

    expect(navigateSidePanelMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resetNavigationStack: false,
      }),
    );
  });

  it('should default resetNavigationStack to isSidePanelOpened', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);

    const { result } = renderHook(() => useOpenAskAiPageInSidePanel(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAiPage();
    });

    expect(navigateSidePanelMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resetNavigationStack: true,
      }),
    );
  });

  it('should not open the panel AskAI page while on the AI chat page', () => {
    const { result } = renderHook(() => useOpenAskAiPageInSidePanel(), {
      wrapper: createWrapper('/chat'),
    });

    act(() => {
      result.current.openAskAiPage();
    });

    expect(navigateSidePanelMenuMock).not.toHaveBeenCalled();
  });

  it('should open the panel AskAI page on the AI chat page when forced', () => {
    const { result } = renderHook(() => useOpenAskAiPageInSidePanel(), {
      wrapper: createWrapper('/chat/6a3b0e10-0b1f-4c62-a2f8-3e1d2c4b5a69'),
    });

    act(() => {
      result.current.openAskAiPage({ force: true });
    });

    expect(navigateSidePanelMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: SidePanelPages.AskAI,
      }),
    );
  });
});
