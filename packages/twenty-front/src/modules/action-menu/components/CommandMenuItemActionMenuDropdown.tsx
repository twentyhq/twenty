import { ActionComponent } from '@/action-menu/actions/display/components/ActionComponent';
import { CommandMenuItemScope } from '@/action-menu/actions/types/CommandMenuItemScope';
import { CommandMenuItemContext } from '@/action-menu/contexts/CommandMenuItemContext';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getSidePanelActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getSidePanelActionMenuDropdownIdFromActionMenuId';
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
        <ActionComponent action={action} key={action.key} />
      ))}
    </OptionsDropdownMenu>
  );
};
