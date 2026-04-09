import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { PINNED_COMMAND_MENU_ITEMS_GAP } from '@/command-menu-item/display/constants/PinnedCommandMenuItemsGap';
import { commandMenuPinnedInlineLayoutState } from '@/command-menu-item/display/states/commandMenuPinnedInlineLayoutState';
import { getVisibleCommandMenuItemCountForContainerWidth } from '@/command-menu-item/display/utils/getVisibleCommandMenuItemCountForContainerWidth';
import { groupCommandMenuItems } from '@/command-menu-item/utils/groupCommandMenuItems';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelPreviousComponentInstanceId';
import { SIDE_PANEL_RESET_CONTEXT_TO_SELECTION } from '@/side-panel/constants/SidePanelResetContextToSelection';
import { SidePanelResetContextToSelectionButton } from '@/side-panel/pages/root/components/SidePanelResetContextToSelectionButton';
import { useFilterCommandMenuItemsWithSidePanelSearch } from '@/side-panel/pages/root/hooks/useFilterCommandMenuItemsWithSidePanelSearch';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isNumber } from '@sniptt/guards';
import { useContext, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

export const SidePanelCommandMenuItemDisplayPage = () => {
  const { t } = useLingui();

  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const { commandMenuItems, commandMenuContextApi } =
    useContext(CommandMenuContext);
  const commandMenuPinnedInlineLayout = useAtomStateValue(
    commandMenuPinnedInlineLayoutState,
  );

  const { filterCommandMenuItemsWithSidePanelSearch } =
    useFilterCommandMenuItemsWithSidePanelSearch({
      sidePanelSearch,
      commandMenuContextApi,
    });

  const { pinned: pinnedCommandMenuItems, other: nonPinnedCommandMenuItems } =
    useMemo(() => groupCommandMenuItems(commandMenuItems), [commandMenuItems]);

  const unpinnedCommandMenuItems = useMemo(
    () =>
      nonPinnedCommandMenuItems.filter(
        (item) =>
          item.availabilityType !== CommandMenuItemAvailabilityType.FALLBACK,
      ),
    [nonPinnedCommandMenuItems],
  );

  const fallbackCommandMenuItems = useMemo(
    () =>
      nonPinnedCommandMenuItems.filter(
        (item) =>
          item.availabilityType === CommandMenuItemAvailabilityType.FALLBACK,
      ),
    [nonPinnedCommandMenuItems],
  );

  const pinnedCommandMenuItemKeysInDisplayOrder = pinnedCommandMenuItems.map(
    (item) => item.id,
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
    pinnedCommandMenuItemKeysInDisplayOrder.every((itemKey) =>
      isNumber(
        commandMenuPinnedInlineLayout.commandMenuItemWidthsByKey[itemKey],
      ),
    );

  const pinnedOverflowCommandMenuItems = hasKnownPinnedInlineLayout
    ? pinnedCommandMenuItems.slice(visiblePinnedCommandMenuItemCount)
    : pinnedCommandMenuItems;

  const matchingPinnedItems = filterCommandMenuItemsWithSidePanelSearch(
    pinnedOverflowCommandMenuItems,
  );
  const matchingOtherItems = filterCommandMenuItemsWithSidePanelSearch(
    unpinnedCommandMenuItems,
  );

  const noResults = !matchingPinnedItems.length && !matchingOtherItems.length;

  const selectableItemIds = [
    ...matchingPinnedItems,
    ...matchingOtherItems,
    ...(noResults ? fallbackCommandMenuItems : []),
  ].map((item) => item.id);

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
    <SidePanelList selectableItemIds={selectableItemIds} noResults={noResults}>
      {isDefined(previousContextStoreCurrentObjectMetadataItemId) && (
        <SidePanelGroup heading={t`Context`}>
          <SidePanelResetContextToSelectionButton />
        </SidePanelGroup>
      )}
      {matchingPinnedItems.length > 0 && (
        <SidePanelGroup heading={t`Pinned`}>
          {matchingPinnedItems.map((item) => (
            <CommandMenuItemRenderer item={item} key={item.id} />
          ))}
        </SidePanelGroup>
      )}
      {matchingOtherItems.length > 0 && (
        <SidePanelGroup heading={t`Other`}>
          {matchingOtherItems.map((item) => (
            <CommandMenuItemRenderer item={item} key={item.id} />
          ))}
        </SidePanelGroup>
      )}
      {noResults && fallbackCommandMenuItems.length > 0 && (
        <SidePanelGroup heading={t`Fallback`}>
          {fallbackCommandMenuItems.map((item) => (
            <CommandMenuItemRenderer item={item} key={item.id} />
          ))}
        </SidePanelGroup>
      )}
    </SidePanelList>
  );
};
