import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { usePinnedCommandMenuItemsInlineLayout } from '@/command-menu-item/display/hooks/usePinnedCommandMenuItemsInlineLayout';
import { getSidePanelCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getSidePanelCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { sidePanelWidgetFooterCommandMenuItemsState } from '@/ui/layout/side-panel/states/sidePanelWidgetFooterCommandMenuItemsState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext, useMemo } from 'react';
import { HorizontalSeparator } from 'twenty-ui/layout';
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

  const sidePanelWidgetFooterCommandMenuItems = useAtomStateValue(
    sidePanelWidgetFooterCommandMenuItemsState,
  );

  const dropdownWidgetCommandMenuItems =
    sidePanelWidgetFooterCommandMenuItems.filter(
      (commandMenuItem) => commandMenuItem.isPinned === false,
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

  const pinnedCommandMenuItems = useMemo(
    () => commandMenuItems.filter((item) => item.isPinned === true),
    [commandMenuItems],
  );

  // Pinned items are buttons in the footer, so the dropdown only repeats the
  // ones the footer could not fit.
  const { pinnedOverflowCommandMenuItems } =
    usePinnedCommandMenuItemsInlineLayout({
      pinnedCommandMenuItems,
      layoutKey: 'side-panel-footer',
    });

  // A widget owning the footer suppresses those buttons entirely, and leaves
  // the footer measurements stale, so every pinned item belongs here instead.
  const hasPinnedWidgetCommandMenuItems =
    sidePanelWidgetFooterCommandMenuItems.some(
      (commandMenuItem) => commandMenuItem.isPinned !== false,
    );

  const pinnedOverflowCommandMenuItemIds = new Set(
    pinnedOverflowCommandMenuItems.map((item) => item.id),
  );

  const listedCommandMenuItems = recordSelectionCommandMenuItems.filter(
    (item) =>
      item.isPinned !== true ||
      hasPinnedWidgetCommandMenuItems ||
      pinnedOverflowCommandMenuItemIds.has(item.id),
  );

  const selectableItemIdArray = [
    ...dropdownWidgetCommandMenuItems.map(
      (commandMenuItem) => commandMenuItem.id,
    ),
    ...listedCommandMenuItems.map((item) => item.id),
  ];

  return (
    <OptionsDropdownMenu
      dropdownId={dropdownId}
      selectableListId={commandMenuId}
      selectableItemIdArray={selectableItemIdArray}
    >
      {dropdownWidgetCommandMenuItems.map((commandMenuItem) => (
        <MenuItem
          key={commandMenuItem.id}
          text={commandMenuItem.label}
          LeftIcon={commandMenuItem.Icon}
          onClick={() => {
            closeDropdown(dropdownId);
            commandMenuItem.onClick();
          }}
        />
      ))}
      {dropdownWidgetCommandMenuItems.length > 0 &&
        listedCommandMenuItems.length > 0 && <HorizontalSeparator noMargin />}
      {listedCommandMenuItems.map((item) => (
        <CommandMenuItemRenderer item={item} key={item.id} />
      ))}
    </OptionsDropdownMenu>
  );
};
