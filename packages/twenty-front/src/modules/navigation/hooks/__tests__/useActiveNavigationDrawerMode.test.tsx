import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

let mockIsCustomizableSidebarEnabled = false;

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsCustomizableSidebarEnabled,
}));

const triageSection: NavigationMenuItem = {
  id: 'triage-section',
  type: NavigationMenuItemType.AI_CHAT_TRIAGE,
  folderId: 'inbox-tab',
  position: 0,
  createdAt: '',
  updatedAt: '',
};

const renderActiveNavigationDrawerMode = ({
  pathname,
  activeTab = NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
  navigationMenuItems = [],
}: {
  pathname: string;
  activeTab?: NavigationDrawerActiveTab;
  navigationMenuItems?: NavigationMenuItem[];
}) => {
  const store = createStore();

  store.set(navigationDrawerActiveTabState.atom, activeTab);
  store.set(metadataStoreState.atomFamily('navigationMenuItems'), {
    current: navigationMenuItems,
    draft: [],
    status: 'up-to-date',
  });

  return renderHook(() => useActiveNavigationDrawerMode(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
      </Provider>
    ),
  });
};

describe('useActiveNavigationDrawerMode', () => {
  beforeEach(() => {
    mockIsCustomizableSidebarEnabled = false;
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

  it.each([
    ['/inbox', NAVIGATION_DRAWER_TABS.NAVIGATION_MENU],
    ['/objects/people', NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY],
  ] as const)(
    'stays on the navigation menu on %s with %s stored once the menu holds the chat sections',
    (pathname, activeTab) => {
      mockIsCustomizableSidebarEnabled = true;

      const { result } = renderActiveNavigationDrawerMode({
        pathname,
        activeTab,
        navigationMenuItems: [triageSection],
      });

      expect(result.current).toBe(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
    },
  );

  it('keeps the AI mode on the inbox page while the customizable sidebar is off', () => {
    const { result } = renderActiveNavigationDrawerMode({
      pathname: '/inbox',
      navigationMenuItems: [triageSection],
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
