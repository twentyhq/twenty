import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { recordLayoutDraftStoreByPageLayoutIdState } from '@/app/states/recordLayoutDraftStoreByPageLayoutIdState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

// Shared cleanup logic for exiting layout customization mode.
// Used by both save and cancel to reset navigation state, page layout
// edit modes, and global customization flag.
export const useExitLayoutCustomizationMode = () => {
  const store = useStore();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftState,
  );
  const setSelectedNavigationMenuItemInEditMode = useSetAtomState(
    selectedNavigationMenuItemInEditModeState,
  );
  const setIsLayoutCustomizationActive = useSetAtomState(
    isLayoutCustomizationActiveState,
  );

  const exitLayoutCustomizationMode = useCallback(() => {
    setNavigationMenuItemsDraft(null);
    setSelectedNavigationMenuItemInEditMode(null);

    const recordLayoutDraftStoreByPageLayoutId = store.get(
      recordLayoutDraftStoreByPageLayoutIdState.atom,
    );

    for (const pageLayoutId of Object.keys(
      recordLayoutDraftStoreByPageLayoutId,
    )) {
      store.set(
        isPageLayoutInEditModeComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
        false,
      );
    }

    store.set(currentPageLayoutIdState.atom, null);
    store.set(recordLayoutDraftStoreByPageLayoutIdState.atom, {});
    setIsLayoutCustomizationActive(false);
    closeSidePanelMenu();
  }, [
    setNavigationMenuItemsDraft,
    setSelectedNavigationMenuItemInEditMode,
    setIsLayoutCustomizationActive,
    closeSidePanelMenu,
    store,
  ]);

  return { exitLayoutCustomizationMode };
};
