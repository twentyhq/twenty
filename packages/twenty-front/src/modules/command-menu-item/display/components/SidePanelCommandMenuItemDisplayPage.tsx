import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { PINNED_COMMAND_MENU_ITEMS_GAP } from '@/command-menu-item/display/constants/PinnedCommandMenuItemsGap';
import { commandMenuPinnedInlineLayoutFamilyState } from '@/command-menu-item/display/states/commandMenuPinnedInlineLayoutFamilyState';
import { getVisibleCommandMenuItemCountForContainerWidth } from '@/command-menu-item/display/utils/getVisibleCommandMenuItemCountForContainerWidth';
import { groupCommandMenuItems } from '@/command-menu-item/utils/groupCommandMenuItems';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useNavigationDrawerTogglePresentation } from '@/navigation/hooks/useNavigationDrawerTogglePresentation';
import { useToggleNavigationDrawer } from '@/navigation/hooks/useToggleNavigationDrawer';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useFilterCommandMenuItemsWithSidePanelSearch } from '@/side-panel/pages/root/hooks/useFilterCommandMenuItemsWithSidePanelSearch';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { useContext, useMemo } from 'react';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const TOGGLE_NAVIGATION_DRAWER_COMMAND_ID = 'toggle-navigation-drawer';

export const SidePanelCommandMenuItemDisplayPage = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();
  const { isNavigationDrawerExpanded, toggleNavigationDrawer } =
    useToggleNavigationDrawer();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const { commandMenuItems, commandMenuContextApi, isInPreviewMode } =
    useContext(CommandMenuContext);

  const { label: navigationDrawerCommandLabel, Icon: NavigationDrawerIcon } =
    useNavigationDrawerTogglePresentation(isNavigationDrawerExpanded);
  const shouldDisplayNavigationDrawerCommand =
    !isMobile &&
    !isSettingsDrawer &&
    !isInPreviewMode &&
    normalizeSearchText(navigationDrawerCommandLabel).includes(
      normalizeSearchText(sidePanelSearch.trim()),
    );

  const handleToggleNavigationDrawer = () => {
    toggleNavigationDrawer();
    closeSidePanelMenu();
  };

  // The command menu list surfaces whatever overflowed out of the page header.
  const commandMenuPinnedInlineLayout = useAtomFamilyStateValue(
    commandMenuPinnedInlineLayoutFamilyState,
    'page-header',
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

  const isSearchActive = isNonEmptyString(sidePanelSearch.trim());

  const pinnedItemsToFilter = isSearchActive
    ? pinnedCommandMenuItems
    : pinnedOverflowCommandMenuItems;

  const matchingPinnedItems =
    filterCommandMenuItemsWithSidePanelSearch(pinnedItemsToFilter);
  const matchingOtherItems = filterCommandMenuItemsWithSidePanelSearch(
    unpinnedCommandMenuItems,
  );

  const hasNoMatchingItems =
    !matchingPinnedItems.length &&
    !matchingOtherItems.length &&
    !shouldDisplayNavigationDrawerCommand;

  const shouldDisplayFallbackItems =
    hasNoMatchingItems && fallbackCommandMenuItems.length > 0;

  const shouldDisplayNoResults =
    isSearchActive && hasNoMatchingItems && !shouldDisplayFallbackItems;

  const selectableItemIds = [
    ...matchingPinnedItems.map((item) => item.id),
    ...matchingOtherItems.map((item) => item.id),
    ...(shouldDisplayNavigationDrawerCommand
      ? [TOGGLE_NAVIGATION_DRAWER_COMMAND_ID]
      : []),
    ...(shouldDisplayFallbackItems
      ? fallbackCommandMenuItems.map((item) => item.id)
      : []),
  ];

  return (
    <SidePanelList
      selectableItemIds={selectableItemIds}
      noResults={shouldDisplayNoResults}
    >
      {matchingPinnedItems.length > 0 && (
        <SidePanelGroup heading={t`Pinned`}>
          {matchingPinnedItems.map((item) => (
            <CommandMenuItemRenderer item={item} key={item.id} />
          ))}
        </SidePanelGroup>
      )}
      {(matchingOtherItems.length > 0 ||
        shouldDisplayNavigationDrawerCommand) && (
        <SidePanelGroup heading={t`Other`}>
          {matchingOtherItems.map((item) => (
            <CommandMenuItemRenderer item={item} key={item.id} />
          ))}
          {shouldDisplayNavigationDrawerCommand && (
            <SelectableListItem
              itemId={TOGGLE_NAVIGATION_DRAWER_COMMAND_ID}
              onEnter={handleToggleNavigationDrawer}
            >
              <CommandMenuItem
                id={TOGGLE_NAVIGATION_DRAWER_COMMAND_ID}
                label={navigationDrawerCommandLabel}
                Icon={NavigationDrawerIcon}
                onClick={handleToggleNavigationDrawer}
              />
            </SelectableListItem>
          )}
        </SidePanelGroup>
      )}
      {shouldDisplayFallbackItems && (
        <SidePanelGroup heading={t`Fallback`}>
          {fallbackCommandMenuItems.map((item) => (
            <CommandMenuItemRenderer item={item} key={item.id} />
          ))}
        </SidePanelGroup>
      )}
    </SidePanelList>
  );
};
