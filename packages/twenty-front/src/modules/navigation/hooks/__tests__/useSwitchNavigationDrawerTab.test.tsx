import { MemoryRouterAppNavigatorProvider } from '~/testing/components/MemoryRouterAppNavigatorProvider';
import { useReturnFromExpandedAiChat } from '@/ai-chat/hooks/useReturnFromExpandedAiChat';
import { useSwitchToNewAiChat } from '@/ai-chat/composer/hooks/useSwitchToNewAiChat';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { useOpenNavigationMenuTabFirstEntry } from '@/navigation-menu-item/display/hooks/useOpenNavigationMenuTabFirstEntry';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useSwitchNavigationDrawerTab } from '@/navigation/hooks/useSwitchNavigationDrawerTab';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useIsMobile } from 'twenty-ui/utilities';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';

jest.mock('@/ai-chat/hooks/useReturnFromExpandedAiChat');
jest.mock('@/ai-chat/composer/hooks/useSwitchToNewAiChat');
jest.mock('@/navigation/hooks/useDefaultHomePagePath');
jest.mock(
  '@/navigation-menu-item/display/hooks/useOpenNavigationMenuTabFirstEntry',
);
jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: jest.fn(),
}));
jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: jest.fn(),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));
jest.mock('@/ai-chat/hooks/useSelectAiChatThread', () => ({
  useSelectAiChatThread: () => ({ selectAiChatThread: jest.fn() }),
}));
jest.mock('@/side-panel/hooks/useOpenAskAiPageInSidePanel', () => ({
  useOpenAskAiPageInSidePanel: () => ({ openAskAiPage: jest.fn() }),
}));

const DEFAULT_HOME_PAGE_PATH = '/objects/companies';
const AI_CHAT_PATH = '/chat/20202020-0687-4c41-b707-ed1bfca972a7';

const mockSwitchToNewChat = jest.fn();
const mockReturnFromExpandedAiChat = jest.fn();
const mockOpenNavigationMenuTabFirstEntry = jest.fn();

const renderSwitchNavigationDrawerMode = ({
  pathname,
  memorizedUrl = '/objects/people',
  expandedMemorized = true,
  mobileNavigationDrawer = 'main',
  currentNavigationMenuTabId = null,
  isLayoutCustomizationModeEnabled = false,
}: {
  pathname: string;
  memorizedUrl?: string;
  expandedMemorized?: boolean;
  mobileNavigationDrawer?: 'main' | 'settings';
  currentNavigationMenuTabId?: string | null;
  isLayoutCustomizationModeEnabled?: boolean;
}) => {
  const store = createStore();

  store.set(currentNavigationMenuTabIdState.atom, currentNavigationMenuTabId);
  store.set(
    isLayoutCustomizationModeEnabledState.atom,
    isLayoutCustomizationModeEnabled,
  );

  store.set(navigationMemorizedUrlState.atom, memorizedUrl);
  store.set(navigationDrawerExpandedMemorizedState.atom, expandedMemorized);
  store.set(isNavigationDrawerExpandedState.atom, true);
  store.set(currentMobileNavigationDrawerState.atom, mobileNavigationDrawer);

  const { result } = renderHook(
    () => ({
      ...useSwitchNavigationDrawerTab(),
      location: useLocation(),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <MemoryRouter initialEntries={[pathname]}>
            <MemoryRouterAppNavigatorProvider>
              {children}
            </MemoryRouterAppNavigatorProvider>
          </MemoryRouter>
        </Provider>
      ),
    },
  );

  return { result, store };
};

describe('useSwitchNavigationDrawerTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    jest.mocked(useSwitchToNewAiChat).mockReturnValue({
      switchToNewAiChat: mockSwitchToNewChat,
    });
    jest
      .mocked(useReturnFromExpandedAiChat)
      .mockReturnValue(mockReturnFromExpandedAiChat);
    jest.mocked(useDefaultHomePagePath).mockReturnValue({
      defaultHomePagePath: DEFAULT_HOME_PAGE_PATH,
    });
    jest.mocked(useIsMobile).mockReturnValue(false);
    jest.mocked(useIsFeatureEnabled).mockReturnValue(true);
    jest.mocked(useOpenNavigationMenuTabFirstEntry).mockReturnValue({
      openNavigationMenuTabFirstEntry: mockOpenNavigationMenuTabFirstEntry,
    });
    mockOpenNavigationMenuTabFirstEntry.mockReturnValue(true);
  });

  it('opens the first entry of the tab it switches to', () => {
    const { result, store } = renderSwitchNavigationDrawerMode({
      pathname: '/objects/people',
    });

    act(() => result.current.switchToNavigationMenuTab('chats-tab-id'));

    expect(mockOpenNavigationMenuTabFirstEntry).toHaveBeenCalledWith({
      tabId: 'chats-tab-id',
      shouldReplace: false,
    });
    expect(store.get(currentNavigationMenuTabIdState.atom)).toBe(
      'chats-tab-id',
    );
  });

  it('opens the default home page when switching back to Home', () => {
    const { result, store } = renderSwitchNavigationDrawerMode({
      pathname: '/chat',
      currentNavigationMenuTabId: 'chats-tab-id',
    });

    act(() =>
      result.current.switchNavigationDrawerTab(
        NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
      ),
    );

    expect(result.current.location.pathname).toBe(DEFAULT_HOME_PAGE_PATH);
    expect(store.get(currentNavigationMenuTabIdState.atom)).toBeNull();
  });

  it('opens the first entry when leaving settings for another tab', () => {
    const { result, store } = renderSwitchNavigationDrawerMode({
      pathname: '/settings/profile',
    });

    act(() => result.current.switchToNavigationMenuTab('chats-tab-id'));

    expect(mockOpenNavigationMenuTabFirstEntry).toHaveBeenCalledWith({
      tabId: 'chats-tab-id',
      shouldReplace: true,
    });
    expect(result.current.location.pathname).toBe('/settings/profile');
    expect(store.get(navigationDrawerActiveTabState.atom)).toBe(
      NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    );
  });

  it('stays on the current page when the tab has nothing to open', () => {
    mockOpenNavigationMenuTabFirstEntry.mockReturnValue(false);
    const { result, store } = renderSwitchNavigationDrawerMode({
      pathname: '/objects/people',
    });

    act(() => result.current.switchToNavigationMenuTab('empty-tab-id'));

    expect(result.current.location.pathname).toBe('/objects/people');
    expect(store.get(currentNavigationMenuTabIdState.atom)).toBe(
      'empty-tab-id',
    );
  });

  it('does nothing when the tab is already active', () => {
    const { result } = renderSwitchNavigationDrawerMode({
      pathname: '/objects/people',
      currentNavigationMenuTabId: 'chats-tab-id',
    });

    act(() => result.current.switchToNavigationMenuTab('chats-tab-id'));

    expect(mockOpenNavigationMenuTabFirstEntry).not.toHaveBeenCalled();
    expect(result.current.location.pathname).toBe('/objects/people');
  });

  it('does not navigate while customizing the layout', () => {
    const { result, store } = renderSwitchNavigationDrawerMode({
      pathname: '/objects/people',
      currentNavigationMenuTabId: 'chats-tab-id',
      isLayoutCustomizationModeEnabled: true,
    });

    act(() =>
      result.current.switchNavigationDrawerTab(
        NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
      ),
    );
    act(() => result.current.switchToNavigationMenuTab('other-tab-id'));

    expect(mockOpenNavigationMenuTabFirstEntry).not.toHaveBeenCalled();
    expect(result.current.location.pathname).toBe('/objects/people');
    expect(store.get(currentNavigationMenuTabIdState.atom)).toBe(
      'other-tab-id',
    );
  });

  it('does not navigate when the customizable sidebar is disabled', () => {
    jest.mocked(useIsFeatureEnabled).mockReturnValue(false);
    const { result } = renderSwitchNavigationDrawerMode({
      pathname: '/objects/people',
      currentNavigationMenuTabId: 'chats-tab-id',
    });

    act(() =>
      result.current.switchNavigationDrawerTab(
        NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
      ),
    );

    expect(result.current.location.pathname).toBe('/objects/people');
  });

  it('leaves settings for the memorized location and restores the mobile drawer', () => {
    jest.mocked(useIsMobile).mockReturnValue(true);
    const { result, store } = renderSwitchNavigationDrawerMode({
      pathname: '/settings/profile',
      expandedMemorized: false,
    });

    act(() =>
      result.current.switchNavigationDrawerTab(
        NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
      ),
    );

    expect(result.current.location.pathname).toBe('/objects/people');
    expect(store.get(isNavigationDrawerExpandedState.atom)).toBe(false);
    expect(store.get(navigationDrawerActiveTabState.atom)).toBe(
      NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    );
  });

  it('leaves settings for the default home page when it was opened from the chat', () => {
    const { result } = renderSwitchNavigationDrawerMode({
      pathname: '/settings/profile',
      memorizedUrl: AI_CHAT_PATH,
    });

    act(() =>
      result.current.switchNavigationDrawerTab(
        NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
      ),
    );

    expect(result.current.location.pathname).toBe(DEFAULT_HOME_PAGE_PATH);
  });

  it('returns from the chat page without navigating itself', () => {
    const { result, store } = renderSwitchNavigationDrawerMode({
      pathname: AI_CHAT_PATH,
    });

    act(() =>
      result.current.switchNavigationDrawerTab(
        NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
      ),
    );

    expect(mockReturnFromExpandedAiChat).toHaveBeenCalled();
    expect(store.get(navigationDrawerActiveTabState.atom)).toBe(
      NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    );
  });

  it('opens the chat page from the settings mode', () => {
    const { result, store } = renderSwitchNavigationDrawerMode({
      pathname: '/settings/profile',
    });

    act(() =>
      result.current.switchNavigationDrawerTab(
        NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
      ),
    );

    expect(mockSwitchToNewChat).toHaveBeenCalled();
    expect(store.get(navigationDrawerActiveTabState.atom)).toBe(
      NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
    );
  });

  it('opens the chat page when the chat history is listed on another page', () => {
    const { result } = renderSwitchNavigationDrawerMode({
      pathname: '/objects/people',
    });

    act(() =>
      result.current.switchNavigationDrawerTab(
        NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
      ),
    );

    expect(mockSwitchToNewChat).toHaveBeenCalled();
  });

  it.each([AI_CHAT_PATH, '/inbox'])(
    'does not start a new chat when %s is already open',
    (pathname) => {
      const { result } = renderSwitchNavigationDrawerMode({ pathname });

      act(() =>
        result.current.switchNavigationDrawerTab(
          NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
        ),
      );

      expect(mockSwitchToNewChat).not.toHaveBeenCalled();
    },
  );

  it.each([false, true])(
    'preserves desktop sidebar expansion (%s) when opening settings and returning home',
    (isExpanded) => {
      const { result, store } = renderSwitchNavigationDrawerMode({
        pathname: '/objects/people',
      });
      act(() => store.set(isNavigationDrawerExpandedState.atom, isExpanded));

      act(() =>
        result.current.switchNavigationDrawerTab(
          NAVIGATION_DRAWER_TABS.SETTINGS,
        ),
      );

      expect(result.current.location.pathname).toBe('/settings/profile');
      expect(store.get(isNavigationDrawerExpandedState.atom)).toBe(isExpanded);

      act(() =>
        result.current.switchNavigationDrawerTab(
          NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
        ),
      );

      expect(result.current.location.pathname).toBe('/objects/people');
      expect(store.get(isNavigationDrawerExpandedState.atom)).toBe(isExpanded);
    },
  );

  it.each([false, true])(
    'keeps the latest desktop sidebar choice (%s) when leaving settings',
    (isExpanded) => {
      const { result, store } = renderSwitchNavigationDrawerMode({
        pathname: DEFAULT_HOME_PAGE_PATH,
      });
      act(() => store.set(isNavigationDrawerExpandedState.atom, !isExpanded));
      act(() =>
        result.current.switchNavigationDrawerTab(
          NAVIGATION_DRAWER_TABS.SETTINGS,
        ),
      );
      expect(result.current.location.pathname).toBe('/settings/profile');

      act(() => store.set(isNavigationDrawerExpandedState.atom, isExpanded));
      act(() =>
        result.current.switchNavigationDrawerTab(
          NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
        ),
      );

      expect(result.current.location.pathname).toBe(DEFAULT_HOME_PAGE_PATH);
      expect(store.get(isNavigationDrawerExpandedState.atom)).toBe(isExpanded);
    },
  );

  it('stays collapsed through Home → Settings → AI → Home', () => {
    jest.mocked(useSwitchToNewAiChat).mockImplementation(
      jest.requireActual<{
        useSwitchToNewAiChat: typeof useSwitchToNewAiChat;
      }>('@/ai-chat/composer/hooks/useSwitchToNewAiChat').useSwitchToNewAiChat,
    );
    jest.mocked(useReturnFromExpandedAiChat).mockImplementation(
      jest.requireActual<{
        useReturnFromExpandedAiChat: typeof useReturnFromExpandedAiChat;
      }>('@/ai-chat/hooks/useReturnFromExpandedAiChat')
        .useReturnFromExpandedAiChat,
    );
    const { result, store } = renderSwitchNavigationDrawerMode({
      pathname: DEFAULT_HOME_PAGE_PATH,
    });
    act(() => store.set(isNavigationDrawerExpandedState.atom, false));

    expect(result.current.location.pathname).toBe(DEFAULT_HOME_PAGE_PATH);
    expect(store.get(isNavigationDrawerExpandedState.atom)).toBe(false);

    for (const [mode, pathname] of [
      [NAVIGATION_DRAWER_TABS.SETTINGS, '/settings/profile'],
      [NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY, '/chat'],
      [NAVIGATION_DRAWER_TABS.NAVIGATION_MENU, DEFAULT_HOME_PAGE_PATH],
    ] as const) {
      window.history.replaceState(null, '', result.current.location.pathname);
      act(() => result.current.switchNavigationDrawerTab(mode));

      expect(result.current.location.pathname).toBe(pathname);
      expect(store.get(isNavigationDrawerExpandedState.atom)).toBe(false);
    }
    window.history.replaceState(null, '', '/');
  });

  it('opens the settings drawer on mobile even when it was closed', () => {
    jest.mocked(useIsMobile).mockReturnValue(true);
    const { result, store } = renderSwitchNavigationDrawerMode({
      pathname: '/objects/people',
    });
    act(() => store.set(isNavigationDrawerExpandedState.atom, false));

    act(() =>
      result.current.switchNavigationDrawerTab(NAVIGATION_DRAWER_TABS.SETTINGS),
    );

    expect(result.current.location.pathname).toBe('/settings/profile');
    expect(store.get(isNavigationDrawerExpandedState.atom)).toBe(true);
  });

  it('opens settings and memorizes where it came from', () => {
    const { result, store } = renderSwitchNavigationDrawerMode({
      pathname: '/objects/people',
    });

    act(() =>
      result.current.switchNavigationDrawerTab(NAVIGATION_DRAWER_TABS.SETTINGS),
    );

    expect(result.current.location.pathname).toBe('/settings/profile');
    expect(store.get(navigationMemorizedUrlState.atom)).toBe('/objects/people');
    expect(store.get(navigationDrawerActiveTabState.atom)).toBe(
      NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    );
  });

  it('opens settings from a page the mobile drawer only thinks is settings', () => {
    jest.mocked(useIsMobile).mockReturnValue(true);

    const { result } = renderSwitchNavigationDrawerMode({
      pathname: '/objects/people',
      mobileNavigationDrawer: 'settings',
    });

    act(() =>
      result.current.switchNavigationDrawerTab(NAVIGATION_DRAWER_TABS.SETTINGS),
    );

    expect(result.current.location.pathname).toBe('/settings/profile');
  });

  it('stays put when settings is already open', () => {
    const { result } = renderSwitchNavigationDrawerMode({
      pathname: '/settings/experience',
    });

    act(() =>
      result.current.switchNavigationDrawerTab(NAVIGATION_DRAWER_TABS.SETTINGS),
    );

    expect(result.current.location.pathname).toBe('/settings/experience');
  });
});
