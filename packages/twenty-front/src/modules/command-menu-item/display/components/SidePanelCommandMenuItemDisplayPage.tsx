import { COMMAND_MENU_ITEM_SECTIONS_IN_DISPLAY_ORDER } from '@/command-menu-item/constants/CommandMenuItemSectionsInDisplayOrder';
import { COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID } from '@/command-menu-item/constants/CommandMenuAskAiFallbackItemId';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuAskAiFallbackItem } from '@/command-menu-item/display/components/CommandMenuAskAiFallbackItem';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { CommandMenuItemSectionGroup } from '@/command-menu-item/display/components/CommandMenuItemSectionGroup';
import { useCommandMenuAppActions } from '@/command-menu-item/display/hooks/useCommandMenuAppActions';
import { useCommandMenuItemCurrentViewSectionContext } from '@/command-menu-item/display/hooks/useCommandMenuItemCurrentViewSectionContext';
import { useCommandMenuItemObjectSectionContext } from '@/command-menu-item/display/hooks/useCommandMenuItemObjectSectionContext';
import { useCommandMenuItemWorkspaceSectionContext } from '@/command-menu-item/display/hooks/useCommandMenuItemWorkspaceSectionContext';
import { useCommandMenuItemSelectionSectionContext } from '@/command-menu-item/display/hooks/useCommandMenuItemSelectionSectionContext';
import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';
import { groupCommandMenuItems } from '@/command-menu-item/utils/groupCommandMenuItems';
import { groupCommandMenuItemsBySection } from '@/command-menu-item/utils/groupCommandMenuItemsBySection';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CoreObjectsCommands } from '@/object-core/commands/components/CoreObjectsCommands';
import { useCoreObjectsCommands } from '@/object-core/commands/hooks/useCoreObjectsCommands';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useFilterCommandMenuItemsWithSidePanelSearch } from '@/side-panel/pages/root/hooks/useFilterCommandMenuItemsWithSidePanelSearch';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconApps,
  IconArrowUpRight,
  IconBox,
  IconCheckbox,
  IconLifebuoy,
  IconPlus,
  IconSearch,
  IconTable,
  type IconComponent,
} from 'twenty-ui/icon';
import {
  CommandMenuItemAvailabilityType,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const SECTION_ICONS: Record<CommandMenuItemSection, IconComponent> = {
  SELECTION: IconCheckbox,
  CURRENT_VIEW: IconTable,
  THIS_OBJECT: IconBox,
  ASK_AND_FIND: IconSearch,
  CREATE_RECORD: IconPlus,
  WORKSPACE: IconApps,
  GO_TO: IconArrowUpRight,
  FALLBACK: IconLifebuoy,
};

export const SidePanelCommandMenuItemDisplayPage = () => {
  const { t } = useLingui();
  const { appActions } = useCommandMenuAppActions();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const { commandMenuItems, commandMenuContextApi } =
    useContext(CommandMenuContext);

  const { coreObjectsCommandIds } = useCoreObjectsCommands();

  const selectionSectionContext = useCommandMenuItemSelectionSectionContext();
  const currentViewSectionContext =
    useCommandMenuItemCurrentViewSectionContext();
  const objectSectionContext = useCommandMenuItemObjectSectionContext();
  const workspaceSectionContext = useCommandMenuItemWorkspaceSectionContext();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  const { filterCommandMenuItemsWithSidePanelSearch } =
    useFilterCommandMenuItemsWithSidePanelSearch({
      sidePanelSearch,
      commandMenuContextApi,
    });

  // Pinned commands come first in their section.
  const pinnedFirstCommandMenuItems = useMemo(() => {
    const { pinned, other } = groupCommandMenuItems(commandMenuItems);

    return [...pinned, ...other];
  }, [commandMenuItems]);

  const nonFallbackCommandMenuItems = useMemo(
    () =>
      pinnedFirstCommandMenuItems.filter(
        (item) =>
          item.availabilityType !== CommandMenuItemAvailabilityType.FALLBACK,
      ),
    [pinnedFirstCommandMenuItems],
  );

  const fallbackCommandMenuItems = useMemo(
    () =>
      pinnedFirstCommandMenuItems.filter(
        (item) =>
          item.availabilityType === CommandMenuItemAvailabilityType.FALLBACK,
      ),
    [pinnedFirstCommandMenuItems],
  );

  const trimmedSidePanelSearch = sidePanelSearch.trim();

  const isSearchActive = isNonEmptyString(trimmedSidePanelSearch);

  const matchingItems = filterCommandMenuItemsWithSidePanelSearch(
    nonFallbackCommandMenuItems,
  );

  const commandMenuItemsBySection =
    groupCommandMenuItemsBySection(matchingItems);

  const getSectionHeading = (section: CommandMenuItemSection) => {
    switch (section) {
      case 'SELECTION':
        return t`Selection`;
      case 'CURRENT_VIEW':
        return t`View`;
      case 'THIS_OBJECT':
        return isDefined(objectSectionContext) ? t`Object` : t`This object`;
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

  const getSectionContext = (section: CommandMenuItemSection) => {
    switch (section) {
      case 'SELECTION':
        return selectionSectionContext;
      case 'CURRENT_VIEW':
        return currentViewSectionContext;
      case 'THIS_OBJECT':
        return objectSectionContext;
      case 'WORKSPACE':
        return workspaceSectionContext;
      default:
        return undefined;
    }
  };

  const getSectionExtraItemIds = (section: CommandMenuItemSection) => {
    if (section === 'THIS_OBJECT') {
      return coreObjectsCommandIds;
    }

    if (section === 'WORKSPACE') {
      return appActions.map((item) => item.id);
    }

    return [];
  };

  const hasNoMatchingItems =
    !matchingItems.length &&
    appActions.length === 0 &&
    coreObjectsCommandIds.length === 0;

  const shouldDisplayAskAiFallbackItem = isSearchActive && hasAiPermission;

  const shouldDisplayFallbackItems =
    hasNoMatchingItems &&
    (fallbackCommandMenuItems.length > 0 || shouldDisplayAskAiFallbackItem);

  const shouldDisplayNoResults =
    isSearchActive && hasNoMatchingItems && !shouldDisplayFallbackItems;

  const selectableItemIds = [
    ...COMMAND_MENU_ITEM_SECTIONS_IN_DISPLAY_ORDER.flatMap((section) => [
      ...commandMenuItemsBySection[section].map((item) => item.id),
      ...getSectionExtraItemIds(section),
    ]),
    ...(shouldDisplayFallbackItems
      ? fallbackCommandMenuItems.map((item) => item.id)
      : []),
    ...(shouldDisplayFallbackItems && shouldDisplayAskAiFallbackItem
      ? [COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID]
      : []),
  ];

  return (
    <SidePanelList
      selectableItemIds={selectableItemIds}
      noResults={shouldDisplayNoResults}
    >
      {COMMAND_MENU_ITEM_SECTIONS_IN_DISPLAY_ORDER.map((section) => {
        const sectionCommandMenuItems = commandMenuItemsBySection[section];

        if (
          sectionCommandMenuItems.length === 0 &&
          getSectionExtraItemIds(section).length === 0
        ) {
          return null;
        }

        return (
          <CommandMenuItemSectionGroup
            heading={getSectionHeading(section)}
            Icon={SECTION_ICONS[section]}
            context={getSectionContext(section)}
            key={section}
          >
            {sectionCommandMenuItems.map((item) => (
              <CommandMenuItemRenderer item={item} key={item.id} />
            ))}
            {section === 'THIS_OBJECT' && <CoreObjectsCommands />}
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
          </CommandMenuItemSectionGroup>
        );
      })}
      {shouldDisplayFallbackItems && (
        <CommandMenuItemSectionGroup
          heading={t`Use ‘${trimmedSidePanelSearch}’ with...`}
          Icon={IconLifebuoy}
        >
          {fallbackCommandMenuItems.map((item) => (
            <CommandMenuItemRenderer item={item} key={item.id} />
          ))}
          {shouldDisplayAskAiFallbackItem && (
            <CommandMenuAskAiFallbackItem prompt={trimmedSidePanelSearch} />
          )}
        </CommandMenuItemSectionGroup>
      )}
    </SidePanelList>
  );
};
