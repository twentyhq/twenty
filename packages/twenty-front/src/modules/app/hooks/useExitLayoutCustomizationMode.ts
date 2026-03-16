import { activeCustomizationPageLayoutIdsState } from '@/app/states/activeCustomizationPageLayoutIdsState';
import { isLayoutCustomizationModeEnabledState } from '@/app/states/isLayoutCustomizationModeEnabledState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useExitLayoutCustomizationMode = () => {
  const store = useStore();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftState,
  );
  const setSelectedNavigationMenuItemInEditMode = useSetAtomState(
    selectedNavigationMenuItemInEditModeState,
  );
  const setIsLayoutCustomizationModeEnabled = useSetAtomState(
    isLayoutCustomizationModeEnabledState,
  );

  const exitLayoutCustomizationMode = useCallback(() => {
    setNavigationMenuItemsDraft(null);
    setSelectedNavigationMenuItemInEditMode(null);

    store.set(currentPageLayoutIdState.atom, null);
    store.set(activeCustomizationPageLayoutIdsState.atom, []);
    setIsLayoutCustomizationModeEnabled(false);
    closeSidePanelMenu();
  }, [
    setNavigationMenuItemsDraft,
    setSelectedNavigationMenuItemInEditMode,
    setIsLayoutCustomizationModeEnabled,
    closeSidePanelMenu,
    store,
  ]);

  return { exitLayoutCustomizationMode };
};
