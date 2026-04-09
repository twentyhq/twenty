import { CommandMenuItemComponent } from '@/command-menu-item/display/components/CommandMenuItemComponent';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { getSidePanelCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getSidePanelCommandMenuDropdownIdFromCommandMenuId';
import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { sidePanelWidgetFooterActionsState } from '@/ui/layout/side-panel/states/sidePanelWidgetFooterActionsState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext } from 'react';
import { HorizontalSeparator } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

export const RecordPageSidePanelCommandMenuDropdown = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  const commandMenuId = useAvailableComponentInstanceIdOrThrow(
    CommandMenuComponentInstanceContext,
  );

  const dropdownId =
    getSidePanelCommandMenuDropdownIdFromCommandMenuId(commandMenuId);

  const { closeDropdown } = useCloseDropdown();

  const sidePanelWidgetFooterActions = useAtomStateValue(
    sidePanelWidgetFooterActionsState,
  );

  const dropdownWidgetActions = sidePanelWidgetFooterActions.filter(
    (widgetAction) => widgetAction.isPinned === false,
  );

  const recordSelectionCommandMenuItems = commandMenuItems.filter(
    (commandMenuItem) =>
      commandMenuItem.scope === CommandMenuItemScope.RecordSelection,
  );

  const selectableItemIdArray = [
    ...dropdownWidgetActions.map((widgetAction) => widgetAction.key),
    ...recordSelectionCommandMenuItems.map(
      (commandMenuItem) => commandMenuItem.key,
    ),
  ];

  return (
    <OptionsDropdownMenu
      dropdownId={dropdownId}
      selectableListId={commandMenuId}
      selectableItemIdArray={selectableItemIdArray}
    >
      {dropdownWidgetActions.map((widgetAction) => (
        <MenuItem
          key={widgetAction.key}
          text={widgetAction.label}
          LeftIcon={widgetAction.Icon}
          onClick={() => {
            closeDropdown(dropdownId);
            widgetAction.onClick();
          }}
        />
      ))}
      {dropdownWidgetActions.length > 0 &&
        recordSelectionCommandMenuItems.length > 0 && (
          <HorizontalSeparator noMargin />
        )}
      {recordSelectionCommandMenuItems.map((commandMenuItem) => (
        <CommandMenuItemComponent
          commandMenuItem={commandMenuItem}
          key={commandMenuItem.key}
        />
      ))}
    </OptionsDropdownMenu>
  );
};
