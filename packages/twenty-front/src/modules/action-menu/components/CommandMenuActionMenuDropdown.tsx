import { ActionDisplayer } from '@/action-menu/actions/display/components/ActionDisplayer';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
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
import { useTheme } from '@emotion/react';
import { useContext } from 'react';
import { Button } from 'twenty-ui/input';
import { getOsControlSymbol } from 'twenty-ui/utilities';

export const CommandMenuActionMenuDropdown = () => {
  const { actions } = useContext(ActionMenuContext);

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const { toggleDropdown } = useDropdownV2();

  const theme = useTheme();

  useScopedHotkeys(
    ['ctrl+o,meta+o'],
    () => {
      toggleDropdown(
        getRightDrawerActionMenuDropdownIdFromActionMenuId(actionMenuId),
        {
          scope:
            CommandMenuActionMenuDropdownHotkeyScope.CommandMenuActionMenuDropdown,
        },
      );
    },
    AppHotkeyScope.CommandMenuOpen,
    [toggleDropdown],
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
          {actions
            .filter(
              (action) => action.scope === ActionMenuEntryScope.RecordSelection,
            )
            .map((action) => (
              <ActionDisplayer action={action} key={action.key} />
            ))}
        </DropdownMenuItemsContainer>
      }
    />
  );
};
