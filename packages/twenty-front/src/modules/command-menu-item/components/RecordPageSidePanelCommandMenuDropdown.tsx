import { SIDE_PANEL_CLICK_OUTSIDE_ID } from '@/side-panel/constants/SidePanelClickOutsideId';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { usePinnedCommandMenuItemsInlineLayout } from '@/command-menu-item/display/hooks/usePinnedCommandMenuItemsInlineLayout';
import { useSidePanelFooterPinnedItemsAvailableWidth } from '@/command-menu-item/hooks/useSidePanelFooterPinnedItemsAvailableWidth';
import { sidePanelWidgetFooterCommandMenuItemsState } from '@/ui/layout/side-panel/states/sidePanelWidgetFooterCommandMenuItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext, useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown, IconButton } from 'twenty-ui/components';
import { IconDotsVertical } from 'twenty-ui/icon';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { getSidePanelCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getSidePanelCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSidePanelOptionsHotkeys } from '@/side-panel/hooks/useSidePanelOptionsHotkeys';
import { CommandMenuDropdownActionItem } from '@/command-menu-item/display/components/CommandMenuDropdownActionItem';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

export const RecordPageSidePanelCommandMenuDropdown = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  const { t } = useLingui();
  const commandMenuId = useAvailableComponentInstanceIdOrThrow(
    CommandMenuComponentInstanceContext,
  );
  const dropdownId =
    getSidePanelCommandMenuDropdownIdFromCommandMenuId(commandMenuId);
  const { closeDropdown } = useCloseDropdown();
  const { handleContentKeyDown } = useSidePanelOptionsHotkeys(dropdownId);

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
    <DropdownRoot
      dropdownId={dropdownId}
      type="menu"
      globalHotkeysConfig={{ enableGlobalHotkeysWithModifiers: true }}
    >
      <Dropdown.Trigger
        data-select-disable
        render={
          <IconButton aria-label={t`Options`} size="sm" variant="outline">
            <IconDotsVertical />
          </IconButton>
        }
      />
      <Dropdown.Content
        data-click-outside-id={SIDE_PANEL_CLICK_OUTSIDE_ID}
        side="top"
        align="end"
        sideOffset={8}
        onKeyDown={handleContentKeyDown}
      >
        <Dropdown.Section>
          {dropdownWidgetCommandMenuItems.map((commandMenuItem) => (
            <Dropdown.ActionItem
              key={commandMenuItem.id}
              startIcon={<SelectOptionIcon Icon={commandMenuItem.Icon} />}
              onClick={() => {
                closeDropdown(dropdownId);
                commandMenuItem.onClick();
              }}
            >
              {commandMenuItem.label}
            </Dropdown.ActionItem>
          ))}
          {isNonEmptyArray(dropdownWidgetCommandMenuItems) &&
            isNonEmptyArray(listedCommandMenuItems) && <Dropdown.Separator />}
          {listedCommandMenuItems.map((item) => (
            <CommandMenuDropdownActionItem item={item} key={item.id} />
          ))}
        </Dropdown.Section>
      </Dropdown.Content>
    </DropdownRoot>
  );
};
