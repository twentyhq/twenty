import { useSwitchToNewAiChat } from '@/ai-chat/composer/hooks/useSwitchToNewAiChat';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { currentNavigationMenuItemFolderIdFamilyState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdFamilyState';
import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { useMobileNavigationBarItems } from '@/navigation/hooks/useMobileNavigationBarItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';

jest.mock('@/ai-chat/composer/hooks/useSwitchToNewAiChat');
jest.mock('@/settings/roles/hooks/useHasPermissionFlag');
jest.mock(
  '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers',
);

jest.mock(
  '@/navigation-menu-item/display/hooks/useNavigationMenuTabIdsWithUnreadChats',
  () => ({
    useNavigationMenuTabIdsWithUnreadChats: () => ({
      tabIdsWithUnreadChats: new Set(['sales-tab']),
      unreadOpenThreadCount: 1,
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

    jest.mocked(useHasPermissionFlag).mockReturnValue(true);
    jest.mocked(useWorkspaceNavigationMenuContainers).mockReturnValue([]);
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
      label: 'Sales, 1 unread',
      isUnread: true,
      hasDividerAfter: true,
    });

    act(() => tapItem(result, 'tab-sales-tab'));

    expect(result.current.location.pathname).toBe('/home');
    expect(result.current.activeItemName).toBe('tab-sales-tab');
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
});
