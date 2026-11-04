import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  FeatureFlagKey,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';

jest.mock('@/settings/roles/hooks/useHasPermissionFlag');

const chatsTab: NavigationMenuItem = {
  id: 'chats-tab',
  type: NavigationMenuItemType.TAB,
  name: 'Chats',
  position: 0,
  createdAt: '',
  updatedAt: '',
};

const inboxSection: NavigationMenuItem = {
  id: 'inbox-section',
  type: NavigationMenuItemType.AI_CHAT_INBOX,
  folderId: 'chats-tab',
  position: 0,
  createdAt: '',
  updatedAt: '',
};

const renderActiveNavigationMenuTab = () => {
  const store = createStore();

  store.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      { key: FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED, value: true },
    ],
  });
  store.set(currentNavigationMenuTabIdState.atom, chatsTab.id);
  store.set(metadataStoreState.atomFamily('navigationMenuItems'), {
    current: [chatsTab, inboxSection],
    draft: [],
    status: 'up-to-date',
  });

  return renderHook(() => useActiveNavigationMenuTab(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter initialEntries={['/objects/companies']}>
          {children}
        </MemoryRouter>
      </Provider>
    ),
  });
};

describe('useActiveNavigationMenuTab', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the selected tab', () => {
    jest.mocked(useHasPermissionFlag).mockReturnValue(true);

    const { result } = renderActiveNavigationMenuTab();

    expect(result.current?.id).toBe(chatsTab.id);
  });

  it('falls back to Home when the member can no longer see the selected tab', () => {
    jest.mocked(useHasPermissionFlag).mockReturnValue(false);

    const { result } = renderActiveNavigationMenuTab();

    expect(result.current).toBeNull();
  });
});
