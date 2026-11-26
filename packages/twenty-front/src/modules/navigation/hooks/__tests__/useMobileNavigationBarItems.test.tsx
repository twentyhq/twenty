import { useSwitchToNewAiChat } from '@/ai-chat/composer/hooks/useSwitchToNewAiChat';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { currentNavigationMenuItemFolderIdFamilyState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdFamilyState';
import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { useHasAiChatSectionInSidebar } from '@/navigation-menu-item/display/hooks/useHasAiChatSectionInSidebar';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { useMobileNavigationBarItems } from '@/navigation/hooks/useMobileNavigationBarItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';

jest.mock('@/ai-chat/composer/hooks/useSwitchToNewAiChat');
jest.mock('@/settings/roles/hooks/useHasPermissionFlag');
jest.mock('@/workspace/hooks/useIsFeatureEnabled');
jest.mock(
  '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers',
);
jest.mock('@/navigation-menu-item/display/hooks/useHasAiChatSectionInSidebar');

let mockUnreadOpenThreadCount = 0;

jest.mock(
  '@/navigation-menu-item/display/hooks/useNavigationMenuChatAttention',
  () => ({
    useNavigationMenuChatAttention: () => ({
      getTabChatAttention: (tabId: string | null) =>
        tabId === 'sales-tab' ? 'needs-input' : null,
      unreadOpenThreadCount: mockUnreadOpenThreadCount,
    }),
  }),
);

jest.mock('@/object-metadata/hooks/useFilteredObjectMetadataItems', () => ({
  useFilteredObjectMetadataItems: () => ({
    alphaSortedActiveNonSystemObjectMetadataItems: [],
  }),
}));

jest.mock('@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel', () => ({
  useOpenRecordsSearchPageInSidePanel: () => ({
    openRecordsSearchPage: jest.fn(),
  }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));

const SALES_TAB: NamedNavigationMenuItem = {
  id: 'sales-tab',
  type: NavigationMenuItemType.TAB,
  name: 'Sales',
  icon: null,
  position: 0,
  isActive: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const mockSwitchToNewChat = jest.fn();

const renderMobileNavigationBarItems = (
  pathname: string,
  previousPathnames: string[] = [],
) => {
  const store = createStore();

  const { result } = renderHook(
    () => ({
      ...useMobileNavigationBarItems(),
      location: useLocation(),
      navigate: useNavigate(),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <I18nProvider i18n={i18n}>
          <Provider store={store}>
            <MemoryRouter initialEntries={[...previousPathnames, pathname]}>
              {children}
            </MemoryRouter>
          </Provider>
        </I18nProvider>
      ),
    },
  );

  return { result, store };
};

const tapItem = (
  result: { current: { items: { name: string; onClick: () => void }[] } },
  name: string,
) => result.current.items.find((item) => item.name === name)?.onClick();

describe('useMobileNavigationBarItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    mockUnreadOpenThreadCount = 0;
    jest.mocked(useHasPermissionFlag).mockReturnValue(true);
    jest.mocked(useIsFeatureEnabled).mockReturnValue(false);
    jest.mocked(useWorkspaceNavigationMenuContainers).mockReturnValue([]);
    jest.mocked(useHasAiChatSectionInSidebar).mockReturnValue(false);
    jest.mocked(useSwitchToNewAiChat).mockReturnValue({
      switchToNewAiChat: mockSwitchToNewChat,
    });
  });

  it('offers home, search and a new chat', () => {
    const { result } = renderMobileNavigationBarItems('/objects/people');

    expect(result.current.items.map(({ name }) => name)).toEqual([
      'home',
      'search',
      'newAiChat',
    ]);
  });

  it('offers each sidebar tab after home and opens home on it', () => {
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([SALES_TAB]);

    const { result } = renderMobileNavigationBarItems('/objects/people');

    expect(result.current.items.map(({ name }) => name)).toEqual([
      'home',
      'tab-sales-tab',
      'search',
      'newAiChat',
    ]);
    expect(
      result.current.items.find(({ name }) => name === 'tab-sales-tab'),
    ).toMatchObject({
      label: 'Sales, needs your input',
      attention: 'needs-input',
      hasDividerAfter: true,
    });

    act(() => tapItem(result, 'tab-sales-tab'));

    expect(result.current.location.pathname).toBe('/home');
    expect(result.current.activeItemName).toBe('tab-sales-tab');
  });

  it('labels an unnamed sidebar tab "Tab"', () => {
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([{ ...SALES_TAB, id: 'unnamed-tab', name: '' }]);

    const { result } = renderMobileNavigationBarItems('/objects/people');

    expect(
      result.current.items.find(({ name }) => name === 'tab-unnamed-tab'),
    ).toMatchObject({ label: 'Tab' });
  });

  it('swaps the new chat for the inbox when the inbox is enabled', () => {
    jest.mocked(useIsFeatureEnabled).mockReturnValue(true);

    const { result } = renderMobileNavigationBarItems('/objects/people');

    expect(result.current.items.map(({ name }) => name)).toEqual([
      'home',
      'inbox',
      'search',
    ]);

    act(() => tapItem(result, 'inbox'));

    expect(result.current.location.pathname).toBe('/inbox');
    expect(result.current.activeItemName).toBe('inbox');
  });

  it('drops the inbox when the sidebar has an AI chat section', () => {
    jest.mocked(useIsFeatureEnabled).mockReturnValue(true);
    jest.mocked(useHasAiChatSectionInSidebar).mockReturnValue(true);

    const { result } = renderMobileNavigationBarItems('/objects/people');

    expect(result.current.items.map(({ name }) => name)).toEqual([
      'home',
      'search',
    ]);
  });

  it('keeps the inbox active while a thread is open', () => {
    jest.mocked(useIsFeatureEnabled).mockReturnValue(true);

    const { result } = renderMobileNavigationBarItems(
      '/inbox/7d2f4a6e-3c1b-4e8a-9f0d-2b5c6a7e8f91',
    );

    expect(result.current.activeItemName).toBe('inbox');
  });

  it('marks the inbox unread outside the inbox only', () => {
    jest.mocked(useIsFeatureEnabled).mockReturnValue(true);
    mockUnreadOpenThreadCount = 2;

    const getInboxItem = (pathname: string) =>
      renderMobileNavigationBarItems(pathname).result.current.items.find(
        ({ name }) => name === 'inbox',
      );

    expect(getInboxItem('/objects/people')).toMatchObject({
      label: 'Inbox, unread',
      attention: 'unread',
    });
    expect(getInboxItem('/inbox')).toMatchObject({
      label: 'Inbox',
      attention: null,
    });
  });

  it('drops the new chat when the workspace has no AI permission', () => {
    jest.mocked(useHasPermissionFlag).mockReturnValue(false);

    const { result } = renderMobileNavigationBarItems('/objects/people');

    expect(result.current.items.map(({ name }) => name)).toEqual([
      'home',
      'search',
    ]);
  });

  it('marks home as active on the home page only', () => {
    expect(
      renderMobileNavigationBarItems('/home').result.current.activeItemName,
    ).toBe('home');
    expect(
      renderMobileNavigationBarItems('/objects/people').result.current
        .activeItemName,
    ).toBe('');
  });

  it('starts a new chat from the chat item', () => {
    const { result } = renderMobileNavigationBarItems('/objects/people');

    act(() => tapItem(result, 'newAiChat'));

    expect(mockSwitchToNewChat).toHaveBeenCalledTimes(1);
  });

  it('replaces the settings entry it leaves so back does not return to it', () => {
    const { result } = renderMobileNavigationBarItems('/settings/profile', [
      '/objects/people',
    ]);

    act(() => tapItem(result, 'home'));

    expect(result.current.location.pathname).toBe('/home');

    act(() => result.current.navigate(-1));

    expect(result.current.location.pathname).toBe('/objects/people');
  });

  it('keeps the page it leaves in history outside of settings', () => {
    const { result } = renderMobileNavigationBarItems('/objects/people');

    act(() => tapItem(result, 'home'));

    expect(result.current.location.pathname).toBe('/home');

    act(() => result.current.navigate(-1));

    expect(result.current.location.pathname).toBe('/objects/people');
  });

  it('keeps each tab on the folder it had open', () => {
    jest.mocked(useIsFeatureEnabled).mockReturnValue(true);
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([SALES_TAB]);

    const { result, store } = renderMobileNavigationBarItems('/objects/people');
    const salesFolderIdAtom =
      currentNavigationMenuItemFolderIdFamilyState.atomFamily('sales-tab');
    const homeFolderIdAtom =
      currentNavigationMenuItemFolderIdFamilyState.atomFamily('home');

    act(() => tapItem(result, 'tab-sales-tab'));
    act(() => store.set(salesFolderIdAtom, 'deals'));

    act(() => tapItem(result, 'home'));
    expect(store.get(homeFolderIdAtom)).toBeNull();

    act(() => tapItem(result, 'tab-sales-tab'));
    expect(store.get(salesFolderIdAtom)).toBe('deals');

    act(() => tapItem(result, 'tab-sales-tab'));
    expect(store.get(salesFolderIdAtom)).toBeNull();
  });

  it('keeps each open folder on its own tab when leaving the AI drawer', () => {
    jest.mocked(useIsFeatureEnabled).mockReturnValue(true);
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([SALES_TAB]);

    const { result, store } = renderMobileNavigationBarItems('/objects/people');
    const salesFolderIdAtom =
      currentNavigationMenuItemFolderIdFamilyState.atomFamily('sales-tab');
    const homeFolderIdAtom =
      currentNavigationMenuItemFolderIdFamilyState.atomFamily('home');

    act(() => tapItem(result, 'home'));
    act(() => store.set(homeFolderIdAtom, 'home-folder'));
    act(() => tapItem(result, 'tab-sales-tab'));
    act(() => store.set(salesFolderIdAtom, 'deals'));
    act(() =>
      store.set(
        navigationDrawerActiveTabState.atom,
        NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
      ),
    );

    act(() => tapItem(result, 'home'));
    expect(store.get(homeFolderIdAtom)).toBe('home-folder');

    act(() => tapItem(result, 'tab-sales-tab'));
    expect(store.get(salesFolderIdAtom)).toBe('deals');
  });

  it('closes the open Home folder on every Home tap while the customizable sidebar is off', () => {
    const { result, store } = renderMobileNavigationBarItems('/objects/people');
    const homeFolderIdAtom =
      currentNavigationMenuItemFolderIdFamilyState.atomFamily('home');

    act(() => tapItem(result, 'home'));
    act(() => store.set(homeFolderIdAtom, 'home-folder'));
    act(() => result.current.navigate('/objects/people'));

    act(() => tapItem(result, 'home'));

    expect(store.get(homeFolderIdAtom)).toBeNull();
  });
});
