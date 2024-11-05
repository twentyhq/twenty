import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ActionMenuDropdownHotkeyScope } from '@/action-menu/types/ActionMenuDropdownHotKeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { Button } from 'twenty-ui';

export const RecordShowRightDrawerActionMenuButton = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  return (
    <Dropdown
      dropdownId={`record-show-right-drawer-action-menu-dropdown-${actionMenuId}`}
      dropdownHotkeyScope={{
        scope: ActionMenuDropdownHotkeyScope.ActionMenuDropdown,
      }}
      data-select-disable
      clickableComponent={<Button title="Actions" />}
      dropdownPlacement="top-end"
      dropdownOffset={{
        y: 10,
      }}
      dropdownComponents={
        <DropdownMenuItemsContainer>
          {actionMenuEntries.map((item, index) => (
            <MenuItem
              key={index}
              LeftIcon={item.Icon}
              onClick={item.onClick}
              text={item.label}
            />
          ))}
        </DropdownMenuItemsContainer>
      }
    />
  );
};
