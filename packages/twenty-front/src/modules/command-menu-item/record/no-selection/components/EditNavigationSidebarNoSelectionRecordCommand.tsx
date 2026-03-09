import { CommandMenuItemExecution } from '@/command-menu-item/display/components/CommandMenuItemExecution';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const EditNavigationSidebarNoSelectionRecordCommand = () => {
  const setIsNavigationMenuInEditMode = useSetAtomState(
    isNavigationMenuInEditModeState,
  );

  return (
    <CommandMenuItemExecution
      onClick={() => setIsNavigationMenuInEditMode(true)}
      closeSidePanelOnCommandMenuItemListActionExecution
    />
  );
};
