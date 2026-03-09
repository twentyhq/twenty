import { Command } from '@/command-menu-item/display/components/Command';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const EditNavigationSidebarNoSelectionRecordCommand = () => {
  const setIsNavigationMenuInEditMode = useSetAtomState(
    isNavigationMenuInEditModeState,
  );

  return (
    <Command
      onClick={() => setIsNavigationMenuInEditMode(true)}
      closeSidePanelOnCommandMenuListExecution
    />
  );
};
