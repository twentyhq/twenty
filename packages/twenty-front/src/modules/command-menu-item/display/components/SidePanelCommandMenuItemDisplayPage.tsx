import { CoreAgentCommandContextProvider } from '@/object-core/commands/components/CoreAgentCommandContextProvider';
import { CoreAgentCommandRecordSyncEffect } from '@/object-core/commands/components/CoreAgentCommandRecordSyncEffect';
import { AppNavigatorContext } from '@/app/contexts/AppNavigatorContext';
import { CoreAgentMetadataEventsEffect } from '@/object-core/agents/components/CoreAgentMetadataEventsEffect';
import { CoreAgentCommands } from '@/object-core/commands/components/CoreAgentCommands';
import { useCoreAgentCommandOrigin } from '@/object-core/commands/hooks/useCoreAgentCommandOrigin';
import { useCoreAgentCommands } from '@/object-core/commands/hooks/useCoreAgentCommands';
import { useExecuteCoreAgentCommand } from '@/object-core/commands/hooks/useExecuteCoreAgentCommand';
import { type CoreAgentCommandOrigin } from '@/object-core/commands/types/CoreAgentCommandOrigin';
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
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  IconApps,
  IconArrowUpRight,
  IconBox,
  IconCheckbox,
  IconCommand,
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
  DEVELOPER: IconCommand,
  FALLBACK: IconLifebuoy,
};

const SidePanelCommandMenuItemDisplayPageContent = ({
  origin,
  pageId,
}: {
  origin: CoreAgentCommandOrigin | null;
  pageId: string;
}) => {
  const { t } = useLingui();
  const { appActions } = useCommandMenuAppActions();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const { commandMenuItems, commandMenuContextApi } =
    useContext(CommandMenuContext);

  const {
    coreObjectCommandIds,
    coreSelectionCommandIds,
    coreSelectionSectionContext,
  } = useCoreObjectsCommands();

  const {
    commands: agentCommands,
    objectContext: agentObjectContext,
    selectionContext: agentSelectionContext,
  } = useCoreAgentCommands(origin);
  const { executeCoreAgentCommand } = useExecuteCoreAgentCommand({
    origin,
    pageId,
  });
  const agentCommandIds = (section: 'THIS_OBJECT' | 'SELECTION') =>
    agentCommands
      .filter((command) => command.section === section)
      .map(({ id }) => `core-agent-${id}`);
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
        if (origin?.target.type === 'record') {
          return t`Agent`;
        }
        return isDefined(agentObjectContext ?? objectSectionContext)
          ? t`Object`
          : t`This object`;
      case 'ASK_AND_FIND':
        return t`Ask & find`;
      case 'CREATE_RECORD':
        return t`Create record`;
      case 'WORKSPACE':
        return t`Workspace`;
      case 'GO_TO':
        return t`Go to`;
      case 'DEVELOPER':
        return t`Developer`;
      case 'FALLBACK':
        return t`Fallback`;
    }
  };

  const getSectionContext = (section: CommandMenuItemSection) => {
    switch (section) {
      case 'SELECTION':
        return isDefined(origin)
          ? agentSelectionContext
          : (coreSelectionSectionContext ?? selectionSectionContext);
      case 'CURRENT_VIEW':
        return currentViewSectionContext;
      case 'THIS_OBJECT':
        return isDefined(origin) ? agentObjectContext : objectSectionContext;
      case 'WORKSPACE':
        return workspaceSectionContext;
      default:
        return undefined;
    }
  };

  const getSectionAppActions = (section: CommandMenuItemSection) =>
    appActions.filter((item) => item.section === section);

  const getSectionExtraItemIds = (section: CommandMenuItemSection) => {
    if (section === 'THIS_OBJECT') {
      return [
        ...coreObjectCommandIds,
        ...agentCommandIds('THIS_OBJECT'),
        ...getSectionAppActions(section).map((item) => item.id),
      ];
    }

    if (section === 'SELECTION') {
      return [...coreSelectionCommandIds, ...agentCommandIds('SELECTION')];
    }

    return getSectionAppActions(section).map((item) => item.id);
  };

  const hasNoMatchingItems =
    !isNonEmptyArray(matchingItems) &&
    !isNonEmptyArray(appActions) &&
    !isNonEmptyArray(coreObjectCommandIds) &&
    !isNonEmptyArray(coreSelectionCommandIds) &&
    !isNonEmptyArray(agentCommands);

  const shouldDisplayAskAiFallbackItem = isSearchActive && hasAiPermission;

  const shouldDisplayFallbackItems =
    hasNoMatchingItems &&
    (isNonEmptyArray(fallbackCommandMenuItems) ||
      shouldDisplayAskAiFallbackItem);

  const shouldDisplayNoResults =
    isSearchActive && hasNoMatchingItems && !shouldDisplayFallbackItems;

  const selectableItemIds = [
    ...COMMAND_MENU_ITEM_SECTIONS_IN_DISPLAY_ORDER.flatMap((section) => [
      ...commandMenuItemsBySection[section].map((item) => item.id),
      ...getSectionExtraItemIds(section),
    ]),
    ...(shouldDisplayFallbackItems && shouldDisplayAskAiFallbackItem
      ? [COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID]
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
      {origin?.target.type === 'index' && <CoreAgentMetadataEventsEffect />}
      {origin?.surfaceType === 'side-panel' &&
        origin.target.type === 'record' && (
          <>
            <CoreAgentCommandRecordSyncEffect agentId={origin.target.agentId} />
            <CoreAgentMetadataEventsEffect agentId={origin.target.agentId} />
          </>
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
          <CommandMenuItemSectionGroup
            heading={getSectionHeading(section)}
            Icon={SECTION_ICONS[section]}
            context={getSectionContext(section)}
            key={section}
          >
            {sectionCommandMenuItems.map((item) => (
              <CommandMenuItemRenderer item={item} key={item.id} />
            ))}
            {(section === 'THIS_OBJECT' || section === 'SELECTION') && (
              <>
                <CoreObjectsCommands section={section} />
                <CoreAgentCommands
                  commands={agentCommands}
                  section={section}
                  executeCommand={executeCoreAgentCommand}
                />
              </>
            )}
            {getSectionAppActions(section).map((item) => {
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
          heading={
            isSearchActive
              ? t`Use ‘${trimmedSidePanelSearch}’ with...`
              : getSectionHeading('FALLBACK')
          }
          Icon={IconLifebuoy}
        >
          {shouldDisplayAskAiFallbackItem && (
            <CommandMenuAskAiFallbackItem prompt={trimmedSidePanelSearch} />
          )}
          {fallbackCommandMenuItems.map((item) => (
            <CommandMenuItemRenderer item={item} key={item.id} />
          ))}
        </CommandMenuItemSectionGroup>
      )}
    </SidePanelList>
  );
};

export const SidePanelCommandMenuItemDisplayPage = () => {
  const { origin, pageId } = useCoreAgentCommandOrigin();
  const navigator = useContext(AppNavigatorContext);
  const { displayType, containerType, isInPreviewMode } =
    useContext(CommandMenuContext);
  const content = (
    <SidePanelCommandMenuItemDisplayPageContent
      origin={origin}
      pageId={pageId}
    />
  );
  return (
    <AppNavigatorContext.Provider
      value={isDefined(origin) ? origin.navigator : navigator}
    >
      {isDefined(origin) ? (
        <CoreAgentCommandContextProvider
          displayType={displayType}
          containerType={containerType}
          isInPreviewMode={isInPreviewMode}
        >
          {content}
        </CoreAgentCommandContextProvider>
      ) : (
        content
      )}
    </AppNavigatorContext.Provider>
  );
};
