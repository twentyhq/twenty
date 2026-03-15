import { useIsLayoutCustomizationDirty } from '@/app/hooks/useIsLayoutCustomizationDirty';
import { activeCustomizationPageLayoutIdsState } from '@/app/states/activeCustomizationPageLayoutIdsState';
import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { navigationMenuItemsState } from '@/navigation-menu-item/states/navigationMenuItemsState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import {
  type NavigationMenuItem,
  PageLayoutType,
} from '~/generated-metadata/graphql';

const PAGE_LAYOUT_ID_1 = 'page-layout-1';
const PAGE_LAYOUT_ID_2 = 'page-layout-2';

const MOCK_PAGE_LAYOUT: PageLayout = {
  __typename: 'PageLayout',
  id: PAGE_LAYOUT_ID_1,
  name: 'Test Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId: 'obj-1',
  tabs: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  deletedAt: null,
  defaultTabToFocusOnMobileAndSidePanelId: null,
};

const MOCK_DRAFT_PAGE_LAYOUT = {
  id: PAGE_LAYOUT_ID_1,
  name: 'Test Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId: 'obj-1',
  tabs: [] as PageLayout['tabs'],
  defaultTabToFocusOnMobileAndSidePanelId: null,
};

const getWrapper =
  (store = createStore()) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

describe('useIsLayoutCustomizationDirty', () => {
  it('should return not dirty when no layouts are touched and nav is clean', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    store.set(navigationMenuItemsState.atom, []);
    store.set(isLayoutCustomizationActiveState.atom, false);

    const { result } = renderHook(() => useIsLayoutCustomizationDirty(), {
      wrapper,
    });

    expect(result.current.isDirty).toBe(false);
  });

  it('should return dirty when a touched page layout draft differs from persisted', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    store.set(navigationMenuItemsState.atom, []);
    store.set(isLayoutCustomizationActiveState.atom, true);
    store.set(activeCustomizationPageLayoutIdsState.atom, [PAGE_LAYOUT_ID_1]);

    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID_1,
      }),
      MOCK_PAGE_LAYOUT,
    );
    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID_1,
      }),
      { ...MOCK_DRAFT_PAGE_LAYOUT, name: 'Modified Layout' },
    );

    const { result } = renderHook(() => useIsLayoutCustomizationDirty(), {
      wrapper,
    });

    expect(result.current.isDirty).toBe(true);
  });

  it('should return not dirty when all touched layouts match persisted', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    store.set(navigationMenuItemsState.atom, []);
    store.set(isLayoutCustomizationActiveState.atom, true);
    store.set(activeCustomizationPageLayoutIdsState.atom, [PAGE_LAYOUT_ID_1]);

    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID_1,
      }),
      MOCK_PAGE_LAYOUT,
    );
    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID_1,
      }),
      MOCK_DRAFT_PAGE_LAYOUT,
    );

    const { result } = renderHook(() => useIsLayoutCustomizationDirty(), {
      wrapper,
    });

    expect(result.current.isDirty).toBe(false);
  });

  it('should return dirty when nav is dirty even if page layouts are clean', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    // userWorkspaceId must be null so item passes workspace filter
    const mockNavItem: NavigationMenuItem = {
      id: 'nav-1',
      position: 0,
      viewId: null,
      targetObjectMetadataId: null,
      folderId: null,
      name: null,
      link: null,
      icon: null,
      color: null,
      targetRecordId: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      userWorkspaceId: null,
    };

    store.set(navigationMenuItemsState.atom, [mockNavItem]);
    store.set(isLayoutCustomizationActiveState.atom, true);
    // Nav draft differs from prefetch
    store.set(navigationMenuItemsDraftState.atom, []);

    const { result } = renderHook(() => useIsLayoutCustomizationDirty(), {
      wrapper,
    });

    expect(result.current.isDirty).toBe(true);
  });

  it('should check multiple touched layouts', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    store.set(navigationMenuItemsState.atom, []);
    store.set(isLayoutCustomizationActiveState.atom, true);
    store.set(activeCustomizationPageLayoutIdsState.atom, [
      PAGE_LAYOUT_ID_1,
      PAGE_LAYOUT_ID_2,
    ]);

    // First layout is clean
    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID_1,
      }),
      MOCK_PAGE_LAYOUT,
    );
    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID_1,
      }),
      MOCK_PAGE_LAYOUT,
    );

    // Second layout is dirty
    const secondLayout: PageLayout = {
      ...MOCK_PAGE_LAYOUT,
      id: PAGE_LAYOUT_ID_2,
      name: 'Second Layout',
    };
    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID_2,
      }),
      secondLayout,
    );
    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID_2,
      }),
      { ...secondLayout, name: 'Modified Second' },
    );

    const { result } = renderHook(() => useIsLayoutCustomizationDirty(), {
      wrapper,
    });

    expect(result.current.isDirty).toBe(true);
  });
});
