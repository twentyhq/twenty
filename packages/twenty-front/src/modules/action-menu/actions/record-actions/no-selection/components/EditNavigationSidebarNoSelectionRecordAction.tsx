import { Action } from '@/action-menu/actions/components/Action';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const EditNavigationSidebarNoSelectionRecordAction = () => {
  const setIsNavigationMenuInEditMode = useSetAtomState(
    isNavigationMenuInEditModeState,
  );

  return (
    <Action
      onClick={() => setIsNavigationMenuInEditMode(true)}
      closeSidePanelOnCommandMenuListActionExecution
    />
  );
};
