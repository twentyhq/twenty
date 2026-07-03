import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { usePinnedCommandMenuItemsInlineLayout } from '@/command-menu-item/display/hooks/usePinnedCommandMenuItemsInlineLayout';
import { groupCommandMenuItems } from '@/command-menu-item/utils/groupCommandMenuItems';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useFilterCommandMenuItemsWithSidePanelSearch } from '@/side-panel/pages/root/hooks/useFilterCommandMenuItemsWithSidePanelSearch';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo } from 'react';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

export const SidePanelCommandMenuItemDisplayPage = () => {
  const { t } = useLingui();

  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const { commandMenuItems, commandMenuContextApi } =
    useContext(CommandMenuContext);

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

  const { pinnedOverflowCommandMenuItems } =
    usePinnedCommandMenuItemsInlineLayout({
      pinnedCommandMenuItems,
    });

  const pinnedItemsToFilter =
    sidePanelSearch.length > 0
      ? pinnedCommandMenuItems
      : pinnedOverflowCommandMenuItems;

  const matchingPinnedItems =
    filterCommandMenuItemsWithSidePanelSearch(pinnedItemsToFilter);
  const matchingOtherItems = filterCommandMenuItemsWithSidePanelSearch(
    unpinnedCommandMenuItems,
  );

  const noResults = !matchingPinnedItems.length && !matchingOtherItems.length;

  const selectableItemIds = [
    ...matchingPinnedItems,
    ...matchingOtherItems,
    ...(noResults ? fallbackCommandMenuItems : []),
  ].map((item) => item.id);

  return (
    <SidePanelList selectableItemIds={selectableItemIds} noResults={noResults}>
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
