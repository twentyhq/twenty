import { addToNavPayloadRegistryState } from '@/navigation-menu-item/common/states/addToNavPayloadRegistryState';
import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useListenToSidePanelClosing } from '@/ui/layout/side-panel/hooks/useListenToSidePanelClosing';
import { useStore } from 'jotai';

export const useResetNavigationMenuItemStateOnSidePanelClose = () => {
  const store = useStore();

  const resetNavigationMenuItemStateOnSidePanelClose = () => {
    store.set(selectedNavigationMenuItemIdInEditModeState.atom, null);
    store.set(pendingInsertionNavigationMenuItemState.atom, null);
    store.set(addToNavPayloadRegistryState.atom, new Map());
  };

  useListenToSidePanelClosing(resetNavigationMenuItemStateOnSidePanelClose);

  return {
    resetNavigationMenuItemStateOnSidePanelClose,
  };
};
