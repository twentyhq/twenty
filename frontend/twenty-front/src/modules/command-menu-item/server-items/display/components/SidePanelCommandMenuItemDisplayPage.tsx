import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { PINNED_COMMAND_MENU_ITEMS_GAP } from '@/command-menu-item/server-items/display/constants/PinnedCommandMenuItemsGap';
import { commandMenuPinnedInlineLayoutState } from '@/command-menu-item/server-items/display/states/commandMenuPinnedInlineLayoutState';
import { getVisibleCommandMenuItemCountForContainerWidth } from '@/command-menu-item/server-items/display/utils/getVisibleCommandMenuItemCountForContainerWidth';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelPreviousComponentInstanceId';
import { SIDE_PANEL_RESET_CONTEXT_TO_SELECTION } from '@/side-panel/constants/SidePanelResetContextToSelection';
import { SidePanelResetContextToSelectionButton } from '@/side-panel/pages/root/components/SidePanelResetContextToSelectionButton';
import { useFilterActionsWithSidePanelSearch } from '@/side-panel/pages/root/hooks/useFilterActionsWithSidePanelSearch';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { type SidePanelCommandMenuItemGroupConfig } from '@/side-panel/types/SidePanelCommandMenuItemGroupConfig';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelCommandMenuItemDisplayPage = () => {
  const { t } = useLingui();

  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const { commandMenuItems } = useContext(CommandMenuContext);
  const commandMenuPinnedInlineLayout = useAtomStateValue(
    commandMenuPinnedInlineLayoutState,
  );

  const { filterActionsWithSidePanelSearch } =
    useFilterActionsWithSidePanelSearch({
      sidePanelSearch,
    });

  const pinnedCommandMenuItems = commandMenuItems
    .filter((commandMenuItem) => commandMenuItem.isPinned === true)
    .sort(
      (firstPinnedCommandMenuItem, secondPinnedCommandMenuItem) =>
        firstPinnedCommandMenuItem.position -
        secondPinnedCommandMenuItem.position,
    );

  const unpinnedCommandMenuItems = commandMenuItems
    .filter((commandMenuItem) => commandMenuItem.isPinned !== true)
    .sort(
      (firstUnpinnedCommandMenuItem, secondUnpinnedCommandMenuItem) =>
        firstUnpinnedCommandMenuItem.position -
        secondUnpinnedCommandMenuItem.position,
    );

  const pinnedCommandMenuItemKeysInDisplayOrder = pinnedCommandMenuItems.map(
    (pinnedCommandMenuItem) => pinnedCommandMenuItem.key,
  );

  const visiblePinnedCommandMenuItemCount =
    getVisibleCommandMenuItemCountForContainerWidth({
      commandMenuItemKeysInDisplayOrder:
        pinnedCommandMenuItemKeysInDisplayOrder,
      commandMenuItemWidthsByKey:
        commandMenuPinnedInlineLayout.commandMenuItemWidthsByKey,
      commandMenuItemsContainerWidth:
        commandMenuPinnedInlineLayout.containerWidth,
      commandMenuItemsGapWidth: PINNED_COMMAND_MENU_ITEMS_GAP,
    });

  const hasKnownPinnedInlineLayout =
    commandMenuPinnedInlineLayout.containerWidth > 0 &&
    pinnedCommandMenuItemKeysInDisplayOrder.every((commandMenuItemKey) =>
      isNumber(
        commandMenuPinnedInlineLayout.commandMenuItemWidthsByKey[
          commandMenuItemKey
        ],
      ),
    );

  const pinnedOverflowCommandMenuItems = hasKnownPinnedInlineLayout
    ? pinnedCommandMenuItems.slice(visiblePinnedCommandMenuItemCount)
    : pinnedCommandMenuItems;

  const matchingPinnedItems = filterActionsWithSidePanelSearch(
    pinnedOverflowCommandMenuItems,
  );
  const matchingOtherItems = filterActionsWithSidePanelSearch(
    unpinnedCommandMenuItems,
  );

  const noResults = !matchingPinnedItems.length && !matchingOtherItems.length;

  const commandGroups: SidePanelCommandMenuItemGroupConfig[] = [
    {
      heading: t`Pinned`,
      items: matchingPinnedItems,
    },
    {
      heading: t`Other`,
      items: matchingOtherItems,
    },
  ];

  const selectableItems = commandGroups.flatMap((group) => group.items ?? []);
  const selectableItemIds = selectableItems.map((item) => item.key);

  // oxlint-disable-next-line twenty/matching-state-variable
  const previousContextStoreCurrentObjectMetadataItemId =
    useAtomComponentStateValue(
      contextStoreCurrentObjectMetadataItemIdComponentState,
      SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID,
    );

  if (isDefined(previousContextStoreCurrentObjectMetadataItemId)) {
    selectableItemIds.unshift(SIDE_PANEL_RESET_CONTEXT_TO_SELECTION);
  }

  return (
    <SidePanelList
      commandGroups={commandGroups}
      selectableItemIds={selectableItemIds}
      noResults={noResults}
    >
      {isDefined(previousContextStoreCurrentObjectMetadataItemId) && (
        <SidePanelGroup heading={t`Context`}>
          <SidePanelResetContextToSelectionButton />
        </SidePanelGroup>
      )}
    </SidePanelList>
  );
};
