import { useToggleNavigationDrawer } from '@/navigation/hooks/useToggleNavigationDrawer';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

const renderToggleNavigationDrawer = (isExpanded: boolean) => {
  const store = createStore();

  store.set(isNavigationDrawerExpandedState.atom, isExpanded);
  store.set(
    navigationDrawerActiveTabState.atom,
    NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
  );

  const { result } = renderHook(() => useToggleNavigationDrawer(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  });

  return { result, store };
};

describe('useToggleNavigationDrawer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('collapses the drawer and returns to the navigation menu', () => {
    const { result, store } = renderToggleNavigationDrawer(true);

    act(() => result.current.toggleNavigationDrawer());

    expect(result.current.isNavigationDrawerExpanded).toBe(false);
    expect(store.get(navigationDrawerActiveTabState.atom)).toBe(
      NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    );
  });

  it('expands the drawer without changing its active tab', () => {
    const { result, store } = renderToggleNavigationDrawer(false);

    act(() => result.current.toggleNavigationDrawer());

    expect(result.current.isNavigationDrawerExpanded).toBe(true);
    expect(store.get(navigationDrawerActiveTabState.atom)).toBe(
      NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
    );
  });

  it('can expand the drawer again after collapsing it', () => {
    const { result, store } = renderToggleNavigationDrawer(true);

    act(() => result.current.toggleNavigationDrawer());
    act(() => result.current.toggleNavigationDrawer());

    expect(result.current.isNavigationDrawerExpanded).toBe(true);
    expect(store.get(navigationDrawerActiveTabState.atom)).toBe(
      NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    );
  });
});
