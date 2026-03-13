import { useEnterLayoutCustomizationMode } from '@/app/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { navigationMenuItemsState } from '@/navigation-menu-item/states/navigationMenuItemsState';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const MOCK_PREFETCH_ITEMS: NavigationMenuItem[] = [
  {
    id: 'item-1',
    position: 0,
    viewId: 'view-1',
    targetObjectMetadataId: 'obj-1',
    folderId: null,
    name: null,
    link: null,
    icon: null,
    color: null,
    targetRecordId: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    userWorkspaceId: 'ws-1',
  },
];

const getWrapper =
  (store = createStore()) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

describe('useEnterLayoutCustomizationMode', () => {
  it('should set isLayoutCustomizationActive to true and initialize nav draft', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    store.set(navigationMenuItemsState.atom, MOCK_PREFETCH_ITEMS);

    const { result } = renderHook(() => useEnterLayoutCustomizationMode(), {
      wrapper,
    });

    act(() => {
      result.current.enterLayoutCustomizationMode();
    });

    expect(store.get(isLayoutCustomizationActiveState.atom)).toBe(true);

    const draft = store.get(navigationMenuItemsDraftState.atom);

    expect(draft).toBeDefined();
    expect(draft).not.toBeNull();
  });

  it('should be idempotent — second call does not reinitialize', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    store.set(navigationMenuItemsState.atom, MOCK_PREFETCH_ITEMS);

    const { result } = renderHook(() => useEnterLayoutCustomizationMode(), {
      wrapper,
    });

    act(() => {
      result.current.enterLayoutCustomizationMode();
    });

    // Modify draft to test idempotency
    store.set(navigationMenuItemsDraftState.atom, []);

    act(() => {
      result.current.enterLayoutCustomizationMode();
    });

    // Draft should NOT be reset since mode is already active
    const draftAfterSecond = store.get(navigationMenuItemsDraftState.atom);

    expect(draftAfterSecond).toEqual([]);
    expect(store.get(isLayoutCustomizationActiveState.atom)).toBe(true);
  });
});
