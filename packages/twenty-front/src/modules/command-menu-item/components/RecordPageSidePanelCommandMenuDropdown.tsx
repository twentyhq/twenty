import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { usePinnedCommandMenuItemsInlineLayout } from '@/command-menu-item/display/hooks/usePinnedCommandMenuItemsInlineLayout';
import { useSidePanelFooterPinnedItemsAvailableWidth } from '@/command-menu-item/hooks/useSidePanelFooterPinnedItemsAvailableWidth';
import { sidePanelWidgetFooterCommandMenuItemsState } from '@/ui/layout/side-panel/states/sidePanelWidgetFooterCommandMenuItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext, useMemo } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { SidePanelOptionsDropdown } from '@/side-panel/components/SidePanelOptionsDropdown';
import { getSidePanelCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getSidePanelCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { CommandMenuDropdownActionItem } from '@/command-menu-item/display/components/CommandMenuDropdownActionItem';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

export const RecordPageSidePanelCommandMenuDropdown = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  const commandMenuId = useAvailableComponentInstanceIdOrThrow(
    CommandMenuComponentInstanceContext,
  );
  const dropdownId =
    getSidePanelCommandMenuDropdownIdFromCommandMenuId(commandMenuId);

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

  const availableWidth = useSidePanelFooterPinnedItemsAvailableWidth();

  // Pinned items are buttons in the footer, so the dropdown only repeats the
  // ones the footer could not fit next to this dropdown's own footprint.
  const { pinnedOverflowCommandMenuItems } =
    usePinnedCommandMenuItemsInlineLayout({
      pinnedCommandMenuItems,
      layoutKey: 'side-panel-footer',
      containerWidth: availableWidth,
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

  const listedCommandMenuItems = hasPinnedWidgetCommandMenuItems
    ? recordSelectionCommandMenuItems
    : recordSelectionCommandMenuItems.filter(
        (item) =>
          item.isPinned !== true ||
          pinnedOverflowCommandMenuItemIds.has(item.id),
      );

  return (
    <SidePanelOptionsDropdown dropdownId={dropdownId}>
      {dropdownWidgetCommandMenuItems.map((commandMenuItem) => (
        <Dropdown.ActionItem
          key={commandMenuItem.id}
          startIcon={<SelectOptionIcon Icon={commandMenuItem.Icon} />}
          onClick={() => commandMenuItem.onClick()}
        >
          {commandMenuItem.label}
        </Dropdown.ActionItem>
      ))}
      {isNonEmptyArray(dropdownWidgetCommandMenuItems) &&
        isNonEmptyArray(listedCommandMenuItems) && <Dropdown.Separator />}
      {listedCommandMenuItems.map((item) => (
        <CommandMenuDropdownActionItem item={item} key={item.id} />
      ))}
    </SidePanelOptionsDropdown>
  );
};
