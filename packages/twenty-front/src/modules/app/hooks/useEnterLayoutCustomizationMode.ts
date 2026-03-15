import { activeCustomizationPageLayoutIdsState } from '@/app/states/activeCustomizationPageLayoutIdsState';
import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/utils/filterWorkspaceNavigationMenuItems';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { navigationMenuItemsState } from '@/navigation-menu-item/states/navigationMenuItemsState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useEnterLayoutCustomizationMode = () => {
  const store = useStore();

  const enterLayoutCustomizationMode = useCallback(() => {
    const isAlreadyActive = store.get(isLayoutCustomizationActiveState.atom);

    if (isAlreadyActive) {
      return;
    }

    const prefetchNavigationMenuItems = store.get(
      navigationMenuItemsState.atom,
    );
    const workspaceNavigationMenuItems = filterWorkspaceNavigationMenuItems(
      prefetchNavigationMenuItems,
    );
    store.set(navigationMenuItemsDraftState.atom, workspaceNavigationMenuItems);

    store.set(activeCustomizationPageLayoutIdsState.atom, []);

    store.set(isLayoutCustomizationActiveState.atom, true);
  }, [store]);

  return { enterLayoutCustomizationMode };
};
