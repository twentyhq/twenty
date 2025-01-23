import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ActionMenuEntryScope } from '@/action-menu/types/ActionMenuEntry';
import { RightDrawerActionMenuDropdownHotkeyScope } from '@/action-menu/types/RightDrawerActionMenuDropdownHotkeyScope';
import { getRightDrawerActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getRightDrawerActionMenuDropdownIdFromActionMenuId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useTheme } from '@emotion/react';
import { Key } from 'ts-key-enum';
import { Button, MenuItem, getOsControlSymbol } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated/graphql';

export const RightDrawerActionMenuDropdown = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const { closeDropdown, openDropdown } = useDropdownV2();

  const theme = useTheme();

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  useScopedHotkeys(
    [Key.Escape, 'ctrl+o,meta+o'],
    () => {
      closeDropdown(
        getRightDrawerActionMenuDropdownIdFromActionMenuId(actionMenuId),
      );
    },
    RightDrawerActionMenuDropdownHotkeyScope.RightDrawerActionMenuDropdown,
    [closeDropdown],
  );

  useScopedHotkeys(
    ['ctrl+o,meta+o'],
    () => {
      openDropdown(
        getRightDrawerActionMenuDropdownIdFromActionMenuId(actionMenuId),
      );
    },
    isCommandMenuV2Enabled
      ? AppHotkeyScope.CommandMenuOpen
      : RightDrawerHotkeyScope.RightDrawer,
    [openDropdown],
  );

  return (
    <Dropdown
      dropdownId={getRightDrawerActionMenuDropdownIdFromActionMenuId(
        actionMenuId,
      )}
      dropdownHotkeyScope={{
        scope:
          RightDrawerActionMenuDropdownHotkeyScope.RightDrawerActionMenuDropdown,
      }}
      data-select-disable
      clickableComponent={
        <Button title="Actions" hotkeys={[getOsControlSymbol(), 'O']} />
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
                text={actionMenuEntry.label}
              />
            ))}
        </DropdownMenuItemsContainer>
      }
    />
  );
};
