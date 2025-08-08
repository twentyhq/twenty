import { ActionComponent } from '@/action-menu/actions/display/components/ActionComponent';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getRightDrawerActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getRightDrawerActionMenuDropdownIdFromActionMenuId';
import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useTheme } from '@emotion/react';
import { useContext } from 'react';
import { Button } from 'twenty-ui/input';
import { getOsControlSymbol } from 'twenty-ui/utilities';

export const CommandMenuActionMenuDropdown = () => {
  const { actions } = useContext(ActionMenuContext);

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const theme = useTheme();

  const dropdownId =
    getRightDrawerActionMenuDropdownIdFromActionMenuId(actionMenuId);
  const { toggleDropdown } = useToggleDropdown();

  const hotkeysConfig = {
    keys: ['ctrl+o', 'meta+o'],
    callback: () => {
      toggleDropdown({
        dropdownComponentInstanceIdFromProps: dropdownId,
      });
    },
    dependencies: [toggleDropdown],
  };

  useHotkeysOnFocusedElement({
    ...hotkeysConfig,
    focusId: SIDE_PANEL_FOCUS_ID,
  });

  useHotkeysOnFocusedElement({
    ...hotkeysConfig,
    focusId: dropdownId,
  });

  const recordSelectionActions = actions.filter(
    (action) => action.scope === ActionScope.RecordSelection,
  );

  const selectableItemIdArray = recordSelectionActions.map(
    (action) => action.key,
  );

  const { setSelectedItemId } = useSelectableList(actionMenuId);

  return (
    <Dropdown
      dropdownId={dropdownId}
      data-select-disable
      clickableComponent={
        <Button title="Options" hotkeys={[getOsControlSymbol(), 'O']} />
      }
      dropdownPlacement="top-end"
      dropdownOffset={{ y: parseInt(theme.spacing(2), 10) }}
      globalHotkeysConfig={{
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: false,
      }}
      onOpen={() => {
        setSelectedItemId(selectableItemIdArray[0]);
      }}
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <SelectableList
              selectableListInstanceId={actionMenuId}
              focusId={dropdownId}
              selectableItemIdArray={selectableItemIdArray}
            >
              {recordSelectionActions.map((action) => (
                <ActionComponent action={action} key={action.key} />
              ))}
            </SelectableList>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
