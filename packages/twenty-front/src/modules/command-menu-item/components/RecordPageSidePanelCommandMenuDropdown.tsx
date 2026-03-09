import { CommandMenuItemComponent } from '@/command-menu-item/display/components/CommandMenuItemComponent';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { getSidePanelCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getSidePanelCommandMenuDropdownIdFromCommandMenuId';
import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext } from 'react';

export const RecordPageSidePanelCommandMenuDropdown = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  const commandMenuId = useAvailableComponentInstanceIdOrThrow(
    CommandMenuComponentInstanceContext,
  );

  const dropdownId =
    getSidePanelCommandMenuDropdownIdFromCommandMenuId(commandMenuId);

  const recordSelectionActions = commandMenuItems.filter(
    (action) => action.scope === CommandMenuItemScope.RecordSelection,
  );

  const selectableItemIdArray = recordSelectionActions.map(
    (action) => action.key,
  );

  return (
    <OptionsDropdownMenu
      dropdownId={dropdownId}
      selectableListId={commandMenuId}
      selectableItemIdArray={selectableItemIdArray}
    >
      {recordSelectionActions.map((action) => (
        <CommandMenuItemComponent action={action} key={action.key} />
      ))}
    </OptionsDropdownMenu>
  );
};
