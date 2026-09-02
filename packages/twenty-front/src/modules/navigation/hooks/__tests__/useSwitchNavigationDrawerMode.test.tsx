import { useReturnFromExpandedAiChat } from '@/ai/hooks/useReturnFromExpandedAiChat';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useSwitchNavigationDrawerMode } from '@/navigation/hooks/useSwitchNavigationDrawerMode';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';

jest.mock('@/ai/hooks/useReturnFromExpandedAiChat');
jest.mock('@/ai/hooks/useSwitchToNewAiChat');
jest.mock('@/navigation/hooks/useDefaultHomePagePath');

const DEFAULT_HOME_PAGE_PATH = '/objects/companies';
const AI_CHAT_PATH = '/chat/20202020-0687-4c41-b707-ed1bfca972a7';

const mockSwitchToNewChat = jest.fn();
const mockReturnFromExpandedAiChat = jest.fn();

const renderSwitchNavigationDrawerMode = ({
  pathname,
  memorizedUrl = '/objects/people',
  expandedMemorized = true,
}: {
  pathname: string;
  memorizedUrl?: string;
  expandedMemorized?: boolean;
}) => {
  const store = createStore();

  store.set(navigationMemorizedUrlState.atom, memorizedUrl);
  store.set(navigationDrawerExpandedMemorizedState.atom, expandedMemorized);
  store.set(isNavigationDrawerExpandedState.atom, true);

  const { result } = renderHook(
    () => ({
      ...useSwitchNavigationDrawerMode(),
      location: useLocation(),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
        </Provider>
      ),
    },
  );

  return { result, store };
};

describe('useSwitchNavigationDrawerMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    jest.mocked(useSwitchToNewAiChat).mockReturnValue({
      switchToNewChat: mockSwitchToNewChat,
    });
    jest
      .mocked(useReturnFromExpandedAiChat)
      .mockReturnValue(mockReturnFromExpandedAiChat);
    jest.mocked(useDefaultHomePagePath).mockReturnValue({
      defaultHomePagePath: DEFAULT_HOME_PAGE_PATH,
    });
  });

  it('leaves settings for the memorized location and restores the drawer', () => {
    const { result, store } = renderSwitchNavigationDrawerMode({
      pathname: '/settings/profile',
      expandedMemorized: false,
    });

    act(() =>
      result.current.switchNavigationDrawerMode(
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
      result.current.switchNavigationDrawerMode(
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
      result.current.switchNavigationDrawerMode(
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
      result.current.switchNavigationDrawerMode(
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
      result.current.switchNavigationDrawerMode(
        NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
      ),
    );
    act(() =>
      result.current.switchNavigationDrawerMode(
        NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
      ),
    );

    expect(mockSwitchToNewChat).toHaveBeenCalledTimes(2);
  });

  it('does not start a new chat when the chat page is already open', () => {
    const { result } = renderSwitchNavigationDrawerMode({
      pathname: AI_CHAT_PATH,
    });

    act(() =>
      result.current.switchNavigationDrawerMode(
        NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
      ),
    );

    expect(mockSwitchToNewChat).not.toHaveBeenCalled();
  });

  it('opens settings and memorizes where it came from', () => {
    const { result, store } = renderSwitchNavigationDrawerMode({
      pathname: '/objects/people',
    });

    act(() =>
      result.current.switchNavigationDrawerMode(
        NAVIGATION_DRAWER_TABS.SETTINGS,
      ),
    );

    expect(result.current.location.pathname).toBe('/settings/profile');
    expect(store.get(navigationMemorizedUrlState.atom)).toBe('/objects/people');
    expect(store.get(navigationDrawerActiveTabState.atom)).toBe(
      NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    );
  });

  it('stays put when settings is already open', () => {
    const { result } = renderSwitchNavigationDrawerMode({
      pathname: '/settings/experience',
    });

    act(() =>
      result.current.switchNavigationDrawerMode(
        NAVIGATION_DRAWER_TABS.SETTINGS,
      ),
    );

    expect(result.current.location.pathname).toBe('/settings/experience');
  });
});
