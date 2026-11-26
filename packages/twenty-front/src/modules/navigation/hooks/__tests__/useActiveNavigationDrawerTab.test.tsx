import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useActiveNavigationDrawerTab } from '@/navigation/hooks/useActiveNavigationDrawerTab';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: jest.fn(),
}));

const renderActiveNavigationDrawerMode = ({
  pathname,
  activeTab = NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
  isLayoutCustomizationModeEnabled = false,
}: {
  pathname: string;
  activeTab?: NavigationDrawerActiveTab;
  isLayoutCustomizationModeEnabled?: boolean;
}) => {
  const store = createStore();

  store.set(navigationDrawerActiveTabState.atom, activeTab);
  store.set(
    isLayoutCustomizationModeEnabledState.atom,
    isLayoutCustomizationModeEnabled,
  );

  return renderHook(() => useActiveNavigationDrawerTab(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
      </Provider>
    ),
  });
};

describe('useActiveNavigationDrawerTab', () => {
  beforeEach(() => {
    jest.mocked(useIsFeatureEnabled).mockReturnValue(false);
  });

  it('is the settings mode on a settings page', () => {
    const { result } = renderActiveNavigationDrawerMode({
      pathname: '/settings/profile',
      activeTab: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
    });

    expect(result.current).toBe(NAVIGATION_DRAWER_TABS.SETTINGS);
  });

  it('is the AI mode on the AI chat page', () => {
    const { result } = renderActiveNavigationDrawerMode({
      pathname: '/chat/20202020-0687-4c41-b707-ed1bfca972a7',
    });

    expect(result.current).toBe(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY);
  });

  it('is the AI mode on the inbox page', () => {
    const { result } = renderActiveNavigationDrawerMode({
      pathname: '/inbox',
    });

    expect(result.current).toBe(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY);
  });

  it('is the AI mode when the chat history is open on another page', () => {
    const { result } = renderActiveNavigationDrawerMode({
      pathname: '/objects/people',
      activeTab: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
    });

    expect(result.current).toBe(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY);
  });

  it('keeps the navigation menu mode on the inbox page while customizing', () => {
    jest.mocked(useIsFeatureEnabled).mockReturnValue(true);

    const { result } = renderActiveNavigationDrawerMode({
      pathname: '/inbox',
      isLayoutCustomizationModeEnabled: true,
    });

    expect(result.current).toBe(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
  });

  it('keeps the chat history while customizing with the customizable sidebar disabled', () => {
    const { result } = renderActiveNavigationDrawerMode({
      pathname: '/objects/people',
      activeTab: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
      isLayoutCustomizationModeEnabled: true,
    });

    expect(result.current).toBe(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY);
  });

  it('is the navigation menu mode anywhere else', () => {
    const { result } = renderActiveNavigationDrawerMode({
      pathname: '/objects/people',
    });

    expect(result.current).toBe(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
  });
});
