import { commandMenuItemsDraftState } from '@/command-menu-item/server-items/edit/states/commandMenuItemsDraftState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useResetRecordIndexSelection } from '@/object-record/record-index/hooks/useResetRecordIndexSelection';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useExitLayoutCustomizationMode = () => {
  const store = useStore();

  const { closeSidePanelMenu } = useSidePanelMenu();
  const { resetRecordIndexSelection } = useResetRecordIndexSelection(
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

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
    resetRecordIndexSelection();
    setNavigationMenuItemsDraft(null);
    setSelectedNavigationMenuItemIdInEditMode(null);
    store.set(commandMenuItemsDraftState.atom, null);
    setIsLayoutCustomizationModeEnabled(false);
    closeSidePanelMenu();
  }, [
    resetRecordIndexSelection,
    setNavigationMenuItemsDraft,
    setSelectedNavigationMenuItemIdInEditMode,
    setIsLayoutCustomizationModeEnabled,
    closeSidePanelMenu,
    store,
  ]);

  return { exitLayoutCustomizationMode };
};
