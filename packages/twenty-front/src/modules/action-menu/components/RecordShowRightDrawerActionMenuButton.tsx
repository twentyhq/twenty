import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { RecordShowRightDrawerActionMenuButtonHotkeyScope } from '@/action-menu/types/RecordShowRightDrawerActionMenuButtonHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useTheme } from '@emotion/react';
import { Button } from 'twenty-ui';

export const RecordShowRightDrawerActionMenuButton = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const { closeDropdown } = useDropdownV2();

  const theme = useTheme();

  return (
    <Dropdown
      dropdownId={`record-show-right-drawer-action-menu-dropdown-${actionMenuId}`}
      dropdownHotkeyScope={{
        scope:
          RecordShowRightDrawerActionMenuButtonHotkeyScope.RecordShowRightDrawerActionMenuButton,
      }}
      data-select-disable
      clickableComponent={<Button title="Actions" shortcut="⌘O" />}
      dropdownPlacement="top-end"
      dropdownOffset={{
        y: parseInt(theme.spacing(2)),
      }}
      dropdownComponents={
        <DropdownMenuItemsContainer>
          {actionMenuEntries.map((item, index) => (
            <MenuItem
              key={index}
              LeftIcon={item.Icon}
              onClick={() => {
                closeDropdown(
                  `record-show-right-drawer-action-menu-dropdown-${actionMenuId}`,
                );
                item.onClick?.();
              }}
              text={item.label}
            />
          ))}
        </DropdownMenuItemsContainer>
      }
    />
  );
};
