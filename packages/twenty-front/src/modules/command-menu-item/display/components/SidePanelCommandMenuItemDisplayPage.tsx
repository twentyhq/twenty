import { COMMAND_MENU_ITEM_SECTIONS_IN_DISPLAY_ORDER } from '@/command-menu-item/constants/CommandMenuItemSectionsInDisplayOrder';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { useCommandMenuAppActions } from '@/command-menu-item/display/hooks/useCommandMenuAppActions';
import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';
import { groupCommandMenuItems } from '@/command-menu-item/utils/groupCommandMenuItems';
import { getCommandMenuItemObjectSectionHeading } from '@/command-menu-item/utils/getCommandMenuItemObjectSectionHeading';
import { groupCommandMenuItemsBySection } from '@/command-menu-item/utils/groupCommandMenuItemsBySection';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CoreObjectsCommands } from '@/object-core/commands/components/CoreObjectsCommands';
import { useCoreObjectsCommands } from '@/object-core/commands/hooks/useCoreObjectsCommands';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useFilterCommandMenuItemsWithSidePanelSearch } from '@/side-panel/pages/root/hooks/useFilterCommandMenuItemsWithSidePanelSearch';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useMemo } from 'react';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

export const SidePanelCommandMenuItemDisplayPage = () => {
  const { t } = useLingui();
  const { appActions } = useCommandMenuAppActions();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const { commandMenuItems, commandMenuContextApi } =
    useContext(CommandMenuContext);

  const { coreObjectsCommandIds } = useCoreObjectsCommands();

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

  const isSearchActive = isNonEmptyString(sidePanelSearch.trim());

  const matchingPinnedItems = filterCommandMenuItemsWithSidePanelSearch(
    pinnedCommandMenuItems,
  );
  const matchingOtherItems = filterCommandMenuItemsWithSidePanelSearch(
    unpinnedCommandMenuItems,
  );

  const commandMenuItemsBySection = useMemo(
    () => groupCommandMenuItemsBySection(matchingOtherItems),
    [matchingOtherItems],
  );

  const getSectionHeading = (section: CommandMenuItemSection) => {
    switch (section) {
      case 'SELECTION':
        return t`Selection`;
      case 'THIS_VIEW':
        return getCommandMenuItemObjectSectionHeading({
          commandMenuContextApi,
          fallbackHeading: t`This object`,
        });
      case 'ASK_AND_FIND':
        return t`Ask & find`;
      case 'CREATE_RECORD':
        return t`Create record`;
      case 'WORKSPACE':
        return t`Workspace`;
      case 'GO_TO':
        return t`Go to`;
      case 'FALLBACK':
        return t`Fallback`;
    }
  };

  const getSectionExtraItemIds = (section: CommandMenuItemSection) => {
    if (section === 'THIS_VIEW') {
      return coreObjectsCommandIds;
    }

    if (section === 'WORKSPACE') {
      return appActions.map((item) => item.id);
    }

    return [];
  };

  const hasNoMatchingItems =
    !matchingPinnedItems.length &&
    !matchingOtherItems.length &&
    appActions.length === 0 &&
    coreObjectsCommandIds.length === 0;

  const shouldDisplayFallbackItems =
    hasNoMatchingItems && fallbackCommandMenuItems.length > 0;

  const shouldDisplayNoResults =
    isSearchActive && hasNoMatchingItems && !shouldDisplayFallbackItems;

  const selectableItemIds = [
    ...matchingPinnedItems.map((item) => item.id),
    ...COMMAND_MENU_ITEM_SECTIONS_IN_DISPLAY_ORDER.flatMap((section) => [
      ...commandMenuItemsBySection[section].map((item) => item.id),
      ...getSectionExtraItemIds(section),
    ]),
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
      {COMMAND_MENU_ITEM_SECTIONS_IN_DISPLAY_ORDER.map((section) => {
        const sectionCommandMenuItems = commandMenuItemsBySection[section];

        if (
          sectionCommandMenuItems.length === 0 &&
          getSectionExtraItemIds(section).length === 0
        ) {
          return null;
        }

        return (
          <SidePanelGroup heading={getSectionHeading(section)} key={section}>
            {sectionCommandMenuItems.map((item) => (
              <CommandMenuItemRenderer item={item} key={item.id} />
            ))}
            {section === 'THIS_VIEW' && <CoreObjectsCommands />}
            {section === 'WORKSPACE' &&
              appActions.map((item) => {
                const handleClick = () => {
                  item.onClick();
                  closeSidePanelMenu();
                };

                return (
                  <SelectableListItem
                    key={item.id}
                    itemId={item.id}
                    onEnter={handleClick}
                  >
                    <CommandMenuItem
                      id={item.id}
                      label={item.label}
                      Icon={item.Icon}
                      onClick={handleClick}
                    />
                  </SelectableListItem>
                );
              })}
          </SidePanelGroup>
        );
      })}
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
