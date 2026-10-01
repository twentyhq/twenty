import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SidePanelPages } from 'twenty-shared/types';
import { IconSparkles } from 'twenty-ui/icon';

const navigateSidePanelMenuMock = jest.fn();
const navigateToAiChatPageMock = jest.fn();

jest.mock('@/ai/hooks/useNavigateToAiChatPage', () => ({
  useNavigateToAiChatPage: () => ({
    navigateToAiChatPage: navigateToAiChatPageMock,
  }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    navigateSidePanelMenu: navigateSidePanelMenuMock,
    openSidePanelMenu: jest.fn(),
    closeSidePanelMenu: jest.fn(),
    toggleSidePanelMenu: jest.fn(),
  }),
}));

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useOpenAskAiPageInSidePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jotaiStore.set(isSidePanelOpenedState.atom, false);
    jotaiStore.set(
      navigationDrawerActiveTabState.atom,
      NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    );
    jotaiStore.set(currentAiChatThreadState.atom, null);
    window.history.pushState({}, '', '/objects/companies');
  });

  it.each([
    ['on the inbox page', '/inbox', NAVIGATION_DRAWER_TABS.NAVIGATION_MENU],
    [
      'with the Inbox mode open on another page',
      '/objects/companies',
      NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
    ],
  ])('opens the chat full page %s', (_, pathname, activeTab) => {
    window.history.pushState({}, '', pathname);
    jotaiStore.set(navigationDrawerActiveTabState.atom, activeTab);
    jotaiStore.set(currentAiChatThreadState.atom, THREAD_ID);

    const { result } = renderHook(() => useOpenAskAiPageInSidePanel(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAiPage();
    });

    expect(navigateToAiChatPageMock).toHaveBeenCalledWith({
      threadId: THREAD_ID,
    });
    expect(navigateSidePanelMenuMock).not.toHaveBeenCalled();
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
    window.history.pushState({}, '', '/chat');

    const { result } = renderHook(() => useOpenAskAiPageInSidePanel(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAiPage();
    });

    expect(navigateSidePanelMenuMock).not.toHaveBeenCalled();
  });
});
