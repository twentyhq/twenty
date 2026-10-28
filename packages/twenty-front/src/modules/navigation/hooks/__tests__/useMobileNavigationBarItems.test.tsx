import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useMobileNavigationBarItems } from '@/navigation/hooks/useMobileNavigationBarItems';
import { useNavigationDrawerAttention } from '@/navigation/hooks/useNavigationDrawerAttention';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  FeatureFlagKey,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

jest.mock('@/ai/hooks/useSwitchToNewAiChat');
jest.mock('@/settings/roles/hooks/useHasPermissionFlag');
jest.mock('@/navigation/hooks/useNavigationDrawerAttention');

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

const mockSwitchToNewChat = jest.fn();
const mockGetTabAttention = jest.fn();

const chatsTab: NavigationMenuItem = {
  id: 'chats-tab',
  type: NavigationMenuItemType.TAB,
  name: 'Chats',
  icon: 'IconMessage',
  position: 0,
  createdAt: '',
  updatedAt: '',
};

const salesTab: NavigationMenuItem = {
  id: 'sales-tab',
  type: NavigationMenuItemType.TAB,
  name: 'Sales',
  icon: 'IconBriefcase',
  position: 1,
  createdAt: '',
  updatedAt: '',
};

const renderMobileNavigationBarItems = (
  pathname: string,
  previousPathnames: string[] = [],
  navigationMenuItems: NavigationMenuItem[] = [],
) => {
  const store = createStore();

  store.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      { key: FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED, value: true },
    ],
  });
  store.set(
    currentUserWorkspaceState.atom,
    mockedUserData.currentUserWorkspace,
  );
  store.set(metadataStoreState.atomFamily('navigationMenuItems'), {
    current: navigationMenuItems,
    draft: [],
    status: 'up-to-date',
  });

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
    jest.mocked(useSwitchToNewAiChat).mockReturnValue({
      switchToNewChat: mockSwitchToNewChat,
    });
    mockGetTabAttention.mockReturnValue(null);
    jest.mocked(useNavigationDrawerAttention).mockReturnValue({
      inboxAttention: null,
      getTabAttention: mockGetTabAttention,
      navigationDrawerAttention: null,
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

  it('lists the sidebar tabs between home and the actions', () => {
    const { result } = renderMobileNavigationBarItems(
      '/objects/people',
      [],
      [chatsTab, salesTab],
    );

    expect(result.current.items.map(({ name }) => name)).toEqual([
      'home',
      'chats-tab',
      'sales-tab',
      'search',
      'newAiChat',
    ]);
  });

  it('opens a tab on the home page', () => {
    const { result } = renderMobileNavigationBarItems(
      '/objects/people',
      [],
      [chatsTab],
    );

    act(() => tapItem(result, 'chats-tab'));

    expect(result.current.location.pathname).toBe('/home');
    expect(result.current.activeItemName).toBe('chats-tab');
  });

  it('flags a tab that needs attention until its content is shown', () => {
    mockGetTabAttention.mockImplementation((tabId: string | null) =>
      tabId === 'chats-tab' ? 'needs-input' : null,
    );
    const { result } = renderMobileNavigationBarItems(
      '/objects/people',
      [],
      [chatsTab],
    );

    expect(
      result.current.items.find(({ name }) => name === 'chats-tab')?.attention,
    ).toBe('needs-input');

    act(() => tapItem(result, 'chats-tab'));

    expect(
      result.current.items.find(({ name }) => name === 'chats-tab')?.attention,
    ).toBeNull();
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
});
