import { ActionComponent } from '@/action-menu/actions/display/components/ActionComponent';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getRightDrawerActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getRightDrawerActionMenuDropdownIdFromActionMenuId';
import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext } from 'react';

export const CommandMenuActionMenuDropdown = () => {
  const { actions } = useContext(ActionMenuContext);

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const dropdownId =
    getRightDrawerActionMenuDropdownIdFromActionMenuId(actionMenuId);

  const recordSelectionActions = actions.filter(
    (action) => action.scope === ActionScope.RecordSelection,
  );

  const selectableItemIdArray = recordSelectionActions.map(
    (action) => action.key,
  );

  const { setSelectedItemId } = useSelectableList(actionMenuId);

  return (
    <OptionsDropdownMenu
      dropdownId={dropdownId}
      selectableListId={actionMenuId}
      selectableItemIdArray={selectableItemIdArray}
      onOpen={() => {
        if (selectableItemIdArray.length > 0) {
          setSelectedItemId(selectableItemIdArray[0]);
        }
      }}
    >
      {recordSelectionActions.map((action) => (
        <ActionComponent action={action} key={action.key} />
      ))}
    </OptionsDropdownMenu>
  );
};
