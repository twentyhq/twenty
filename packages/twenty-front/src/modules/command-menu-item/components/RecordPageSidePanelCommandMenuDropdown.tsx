import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { getSidePanelCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getSidePanelCommandMenuDropdownIdFromCommandMenuId';
import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { sidePanelWidgetFooterActionsState } from '@/ui/layout/side-panel/states/sidePanelWidgetFooterActionsState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext, useMemo } from 'react';
import { HorizontalSeparator } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

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

  const recordSelectionCommandMenuItems = useMemo(
    () =>
      commandMenuItems.filter(
        (item) =>
          item.availabilityType ===
          CommandMenuItemAvailabilityType.RECORD_SELECTION,
      ),
    [commandMenuItems],
  );

  const selectableItemIdArray = [
    ...dropdownWidgetActions.map((widgetAction) => widgetAction.key),
    ...recordSelectionCommandMenuItems.map((item) => item.id),
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
      {recordSelectionCommandMenuItems.map((item) => (
        <CommandMenuItemRenderer item={item} key={item.id} />
      ))}
    </OptionsDropdownMenu>
  );
};
