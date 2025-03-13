import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ActionMenuEntryScope } from '@/action-menu/types/ActionMenuEntry';
import { CommandMenuActionMenuDropdownHotkeyScope } from '@/action-menu/types/CommandMenuActionMenuDropdownHotkeyScope';
import { getRightDrawerActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getRightDrawerActionMenuDropdownIdFromActionMenuId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useTheme } from '@emotion/react';
import { i18n } from '@lingui/core';
import { Key } from 'ts-key-enum';
import { Button, getOsControlSymbol, MenuItem } from 'twenty-ui';

export const CommandMenuActionMenuDropdown = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const { closeDropdown, openDropdown } = useDropdownV2();

  const theme = useTheme();

  useScopedHotkeys(
    [Key.Escape, 'ctrl+o,meta+o'],
    () => {
      closeDropdown(
        getRightDrawerActionMenuDropdownIdFromActionMenuId(actionMenuId),
      );
    },
    CommandMenuActionMenuDropdownHotkeyScope.CommandMenuActionMenuDropdown,
    [closeDropdown],
  );

  useScopedHotkeys(
    ['ctrl+o,meta+o'],
    () => {
      openDropdown(
        getRightDrawerActionMenuDropdownIdFromActionMenuId(actionMenuId),
        {
          scope:
            CommandMenuActionMenuDropdownHotkeyScope.CommandMenuActionMenuDropdown,
        },
      );
    },
    AppHotkeyScope.CommandMenuOpen,
    [openDropdown],
  );

  return (
    <Dropdown
      dropdownId={getRightDrawerActionMenuDropdownIdFromActionMenuId(
        actionMenuId,
      )}
      dropdownHotkeyScope={{
        scope:
          CommandMenuActionMenuDropdownHotkeyScope.CommandMenuActionMenuDropdown,
      }}
      data-select-disable
      clickableComponent={
        <Button title="Options" hotkeys={[getOsControlSymbol(), 'O']} />
      }
      dropdownPlacement="top-end"
      dropdownOffset={{ y: parseInt(theme.spacing(2), 10) }}
      dropdownComponents={
        <DropdownMenuItemsContainer>
          {actionMenuEntries
            .filter(
              (actionMenuEntry) =>
                actionMenuEntry.scope === ActionMenuEntryScope.RecordSelection,
            )
            .map((actionMenuEntry, index) => (
              <MenuItem
                key={index}
                LeftIcon={actionMenuEntry.Icon}
                onClick={() => {
                  closeDropdown(
                    getRightDrawerActionMenuDropdownIdFromActionMenuId(
                      actionMenuId,
                    ),
                  );
                  actionMenuEntry.onClick?.();
                }}
                text={i18n._(actionMenuEntry.label)}
              />
            ))}
        </DropdownMenuItemsContainer>
      }
    />
  );
};
