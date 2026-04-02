import { useUnselectEditModeRecord } from '@/command-menu-item/server-items/edit/hooks/useUnselectEditModeRecord';
import { commandMenuItemEditSelectionModeState } from '@/command-menu-item/server-items/edit/states/commandMenuItemEditSelectionModeState';
import { commandMenuItemsDraftState } from '@/command-menu-item/server-items/edit/states/commandMenuItemsDraftState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useExitLayoutCustomizationMode = () => {
  const store = useStore();

  const { closeSidePanelMenu } = useSidePanelMenu();
  const { unselectEditModeRecord } = useUnselectEditModeRecord();

  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftState,
  );
  const setSelectedNavigationMenuItemIdInEditMode = useSetAtomState(
    selectedNavigationMenuItemIdInEditModeState,
  );
  const setIsLayoutCustomizationModeEnabled = useSetAtomState(
    isLayoutCustomizationModeEnabledState,
  );

  const exitLayoutCustomizationMode = useCallback(() => {
    unselectEditModeRecord();
    setNavigationMenuItemsDraft(null);
    setSelectedNavigationMenuItemIdInEditMode(null);
    store.set(commandMenuItemsDraftState.atom, null);
    store.set(commandMenuItemEditSelectionModeState.atom, 'selection');
    setIsLayoutCustomizationModeEnabled(false);
    closeSidePanelMenu();
  }, [
    unselectEditModeRecord,
    setNavigationMenuItemsDraft,
    setSelectedNavigationMenuItemIdInEditMode,
    setIsLayoutCustomizationModeEnabled,
    closeSidePanelMenu,
    store,
  ]);

  return { exitLayoutCustomizationMode };
};
