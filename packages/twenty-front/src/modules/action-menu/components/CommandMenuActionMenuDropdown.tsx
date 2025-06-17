import { ActionComponent } from '@/action-menu/actions/display/components/ActionComponent';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getRightDrawerActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getRightDrawerActionMenuDropdownIdFromActionMenuId';
import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownHotkeyScope } from '@/ui/layout/dropdown/constants/DropdownHotkeyScope';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
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
  const { toggleDropdown } = useDropdownV2();

  useHotkeysOnFocusedElement({
    keys: ['ctrl+o', 'meta+o'],
    callback: () => {
      toggleDropdown(dropdownId);
    },
    focusId: SIDE_PANEL_FOCUS_ID,
    scope: AppHotkeyScope.CommandMenuOpen,
    dependencies: [toggleDropdown],
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
              hotkeyScope={DropdownHotkeyScope.Dropdown}
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
