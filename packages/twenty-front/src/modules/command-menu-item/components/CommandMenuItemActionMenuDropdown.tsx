import { CommandMenuItemComponent } from '@/command-menu-item/actions/display/components/CommandMenuItemComponent';
import { CommandMenuItemScope } from '@/command-menu-item/actions/types/CommandMenuItemScope';
import { CommandMenuItemContext } from '@/command-menu-item/contexts/CommandMenuItemContext';
import { ActionMenuComponentInstanceContext } from '@/command-menu-item/states/contexts/ActionMenuComponentInstanceContext';
import { getSidePanelActionMenuDropdownIdFromActionMenuId } from '@/command-menu-item/utils/getSidePanelActionMenuDropdownIdFromActionMenuId';
import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext } from 'react';

export const CommandMenuItemActionMenuDropdown = () => {
  const { actions } = useContext(CommandMenuItemContext);

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const dropdownId =
    getSidePanelActionMenuDropdownIdFromActionMenuId(actionMenuId);

  const recordSelectionActions = actions.filter(
    (action) => action.scope === CommandMenuItemScope.RecordSelection,
  );

  const selectableItemIdArray = recordSelectionActions.map(
    (action) => action.key,
  );

  return (
    <OptionsDropdownMenu
      dropdownId={dropdownId}
      selectableListId={actionMenuId}
      selectableItemIdArray={selectableItemIdArray}
    >
      {recordSelectionActions.map((action) => (
        <CommandMenuItemComponent action={action} key={action.key} />
      ))}
    </OptionsDropdownMenu>
  );
};
