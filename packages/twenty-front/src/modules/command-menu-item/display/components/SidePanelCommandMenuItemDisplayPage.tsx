import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { COLLAPSIBLE_COMMAND_MENU_ITEM_SECTIONS } from '@/command-menu-item/constants/CollapsibleCommandMenuItemSections';
import { COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID } from '@/command-menu-item/constants/CommandMenuAskAiFallbackItemId';
import { COMMAND_MENU_INLINE_SEARCH_RECORDS_LIMIT } from '@/command-menu-item/constants/CommandMenuInlineSearchRecordsLimit';
import { COMMAND_MENU_ITEM_SECTIONS_IN_DISPLAY_ORDER } from '@/command-menu-item/constants/CommandMenuItemSectionsInDisplayOrder';
import { COMMAND_MENU_NO_RECORDS_FOUND_ITEM_ID } from '@/command-menu-item/constants/CommandMenuNoRecordsFoundItemId';
import { COMMAND_MENU_SEE_MORE_RECORDS_ITEM_ID } from '@/command-menu-item/constants/CommandMenuSeeMoreRecordsItemId';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuAskAiFallbackItem } from '@/command-menu-item/display/components/CommandMenuAskAiFallbackItem';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { CommandMenuItemSectionGroup } from '@/command-menu-item/display/components/CommandMenuItemSectionGroup';
import { useCommandMenuAppActions } from '@/command-menu-item/display/hooks/useCommandMenuAppActions';
import { useCommandMenuItemCurrentViewSectionContext } from '@/command-menu-item/display/hooks/useCommandMenuItemCurrentViewSectionContext';
import { useCommandMenuItemObjectSectionContext } from '@/command-menu-item/display/hooks/useCommandMenuItemObjectSectionContext';
import { useCommandMenuItemSelectionSectionContext } from '@/command-menu-item/display/hooks/useCommandMenuItemSelectionSectionContext';
import { useCommandMenuItemWorkspaceSectionContext } from '@/command-menu-item/display/hooks/useCommandMenuItemWorkspaceSectionContext';
import { interpolateCommandMenuItemFields } from '@/command-menu-item/display/utils/interpolateCommandMenuItemFields';
import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';
import { getCommandMenuItemSectionPreview } from '@/command-menu-item/utils/getCommandMenuItemSectionPreview';
import { groupCommandMenuItems } from '@/command-menu-item/utils/groupCommandMenuItems';
import { groupCommandMenuItemsBySection } from '@/command-menu-item/utils/groupCommandMenuItemsBySection';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectsCommands } from '@/object-core/commands/components/CoreObjectsCommands';
import { useCoreObjectsCommands } from '@/object-core/commands/hooks/useCoreObjectsCommands';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useFilterCommandMenuItemsWithSidePanelSearch } from '@/side-panel/pages/root/hooks/useFilterCommandMenuItemsWithSidePanelSearch';
import { SidePanelSearchRecordItem } from '@/side-panel/pages/search/components/SidePanelSearchRecordItem';
import { useSidePanelSearchRecords } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecords';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useMemo, useState } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconApps,
  IconArrowRight,
  IconArrowUpRight,
  IconBox,
  IconCheckbox,
  IconCommand,
  IconPlus,
  IconSearch,
  IconSearchOff,
  IconSparkles,
  IconTable,
  type IconComponent,
} from 'twenty-ui/icon';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

type DisplayedCommandMenuItemSection =
  (typeof COMMAND_MENU_ITEM_SECTIONS_IN_DISPLAY_ORDER)[number];

const SECTION_ICONS: Record<DisplayedCommandMenuItemSection, IconComponent> = {
  SELECTION: IconCheckbox,
  CURRENT_VIEW: IconTable,
  THIS_OBJECT: IconBox,
  WORKSPACE: IconApps,
  GO_TO: IconArrowUpRight,
  CREATE_RECORD: IconPlus,
  DEVELOPER: IconCommand,
  ASK_AI: IconSparkles,
  SEARCH: IconSearch,
};

type SectionsToggleState = {
  search: string;
  isOpenBySection: Partial<Record<CommandMenuItemSection, boolean>>;
};

const INITIAL_SECTIONS_TOGGLE_STATE: SectionsToggleState = {
  search: '',
  isOpenBySection: {},
};

const COLLAPSIBLE_SECTIONS: readonly CommandMenuItemSection[] =
  COLLAPSIBLE_COMMAND_MENU_ITEM_SECTIONS;

const MINIMUM_QUESTION_WORD_COUNT = 4;

const getSectionHeaderItemId = (section: CommandMenuItemSection) =>
  `command-menu-section-header-${section}`;

export const SidePanelCommandMenuItemDisplayPage = () => {
  const { t } = useLingui();
  const { appActions } = useCommandMenuAppActions();
  const { closeSidePanelMenu, navigateSidePanelMenu } = useSidePanelMenu();
  const { objectMetadataItems } = useObjectMetadataItems();

  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const setSidePanelSearchObjectFilter = useSetAtomState(
    sidePanelSearchObjectFilterState,
  );
  const { commandMenuItems, commandMenuContextApi } =
    useContext(CommandMenuContext);

  const {
    coreObjectCommandIds,
    coreObjectSectionContext,
    coreSelectionCommandIds,
    coreSelectionSectionContext,
  } = useCoreObjectsCommands();

  const selectionSectionContext = useCommandMenuItemSelectionSectionContext();
  const currentViewSectionContext =
    useCommandMenuItemCurrentViewSectionContext();
  const metadataObjectSectionContext = useCommandMenuItemObjectSectionContext();
  const objectSectionContext =
    coreObjectSectionContext ?? metadataObjectSectionContext;
  const workspaceSectionContext = useCommandMenuItemWorkspaceSectionContext();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isInlineRecordSearchEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );

  const [sectionsToggleState, setSectionsToggleState] = useState(
    INITIAL_SECTIONS_TOGGLE_STATE,
  );

  const {
    searchResultItems,
    loading: isLoadingSearchRecords,
    isWaitingForDebouncedSearch,
    error: searchRecordsError,
  } = useSidePanelSearchRecords({
    shouldSkip: !isInlineRecordSearchEnabled,
    shouldSkipEmptySearch: true,
    shouldIgnoreObjectFilter: true,
    limit: COMMAND_MENU_INLINE_SEARCH_RECORDS_LIMIT + 1,
  });

  const isSearchingRecords =
    isLoadingSearchRecords || isWaitingForDebouncedSearch;

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

  const shouldDisplayAskAiPrompt = isSearchActive && hasAiPermission;

  const isInlineRecordSearchActive =
    isSearchActive && isInlineRecordSearchEnabled;

  const matchingItems = filterCommandMenuItemsWithSidePanelSearch(
    nonFallbackCommandMenuItems,
  );

  const commandMenuItemsBySection =
    groupCommandMenuItemsBySection(matchingItems);

  const inlineSearchResultItems = isInlineRecordSearchActive
    ? searchResultItems.slice(0, COMMAND_MENU_INLINE_SEARCH_RECORDS_LIMIT)
    : [];

  const hasMoreSearchResultItems =
    isInlineRecordSearchActive &&
    searchResultItems.length > COMMAND_MENU_INLINE_SEARCH_RECORDS_LIMIT;

  const shouldDisplayNoRecordsFound =
    isInlineRecordSearchActive &&
    !isSearchingRecords &&
    searchResultItems.length === 0;

  const isSectionOpen = (section: CommandMenuItemSection) => {
    if (!COLLAPSIBLE_SECTIONS.includes(section)) {
      return true;
    }

    const isOpenForSearch =
      sectionsToggleState.search === trimmedSidePanelSearch
        ? sectionsToggleState.isOpenBySection[section]
        : undefined;

    return isOpenForSearch ?? isSearchActive;
  };

  const setSectionOpen = ({
    section,
    isOpen,
  }: {
    section: CommandMenuItemSection;
    isOpen: boolean;
  }) => {
    setSectionsToggleState((toggleState) => ({
      search: trimmedSidePanelSearch,
      isOpenBySection: {
        ...(toggleState.search === trimmedSidePanelSearch
          ? toggleState.isOpenBySection
          : {}),
        [section]: isOpen,
      },
    }));
  };

  const getSectionHeading = (section: DisplayedCommandMenuItemSection) => {
    switch (section) {
      case 'SELECTION':
        return t`Selection`;
      case 'CURRENT_VIEW':
        return t`View`;
      case 'THIS_OBJECT':
        return isDefined(objectSectionContext) ? t`Object` : t`This object`;
      case 'WORKSPACE':
        return t`Workspace`;
      case 'GO_TO':
        return t`Go to`;
      case 'CREATE_RECORD':
        return t`Create record`;
      case 'DEVELOPER':
        return t`Developer`;
      case 'ASK_AI':
        return t`Ask AI`;
      case 'SEARCH':
        return t`Search`;
    }
  };

  const getSectionContext = (section: CommandMenuItemSection) => {
    switch (section) {
      case 'SELECTION':
        return coreSelectionSectionContext ?? selectionSectionContext;
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

  const getSectionAppActions = (section: CommandMenuItemSection) =>
    appActions.filter((item) => item.section === section);

  const getSectionExtraItemIds = (section: CommandMenuItemSection) => {
    if (section === 'THIS_OBJECT') {
      return [
        ...coreObjectCommandIds,
        ...getSectionAppActions(section).map((item) => item.id),
      ];
    }

    if (section === 'SELECTION') {
      return coreSelectionCommandIds;
    }

    return getSectionAppActions(section).map((item) => item.id);
  };

  const hasMatchingCommand = COMMAND_MENU_ITEM_SECTIONS_IN_DISPLAY_ORDER.some(
    (section) =>
      commandMenuItemsBySection[section].length > 0 ||
      getSectionExtraItemIds(section).length > 0,
  );

  const isRecordSearchFallbackRedundant =
    hasMoreSearchResultItems || shouldDisplayNoRecordsFound;

  const displayedFallbackCommandMenuItems =
    isSearchActive && !hasMatchingCommand
      ? fallbackCommandMenuItems.filter(
          (item) =>
            !isRecordSearchFallbackRedundant ||
            item.engineComponentKey !==
              EngineComponentKey.SEARCH_RECORDS_FALLBACK,
        )
      : [];

  const getSectionCommandItemIds = (section: CommandMenuItemSection) => [
    ...commandMenuItemsBySection[section].map((item) => item.id),
    ...getSectionExtraItemIds(section),
  ];

  const getSectionRowItemIds = (
    section: DisplayedCommandMenuItemSection,
  ): string[] => {
    if (section === 'ASK_AI' && shouldDisplayAskAiPrompt) {
      return [
        COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID,
        ...getSectionCommandItemIds(section),
      ];
    }

    if (section === 'SEARCH' && isSearchActive) {
      return [
        ...getSectionCommandItemIds(section),
        ...inlineSearchResultItems.map((item) => item.id),
        ...(hasMoreSearchResultItems
          ? [COMMAND_MENU_SEE_MORE_RECORDS_ITEM_ID]
          : []),
        ...displayedFallbackCommandMenuItems.map((item) => item.id),
      ];
    }

    return getSectionCommandItemIds(section);
  };

  const isSectionDisplayed = (section: DisplayedCommandMenuItemSection) =>
    getSectionRowItemIds(section).length > 0 ||
    (section === 'SEARCH' && shouldDisplayNoRecordsFound);

  const displayedSections =
    COMMAND_MENU_ITEM_SECTIONS_IN_DISPLAY_ORDER.filter(isSectionDisplayed);

  const getSelectableSectionItemIds = (
    section: DisplayedCommandMenuItemSection,
  ) => {
    if (!COLLAPSIBLE_SECTIONS.includes(section)) {
      return getSectionRowItemIds(section);
    }

    return [
      getSectionHeaderItemId(section),
      ...(isSectionOpen(section) ? getSectionRowItemIds(section) : []),
    ];
  };

  const selectableItemIds = displayedSections.flatMap(
    getSelectableSectionItemIds,
  );

  const firstCommandItemId = displayedSections
    .filter((section) => isSectionOpen(section))
    .flatMap(getSectionCommandItemIds)[0];

  const firstRecordItemId = isSearchingRecords
    ? undefined
    : inlineSearchResultItems[0]?.id;

  const doesSearchReadAsQuestion =
    trimmedSidePanelSearch.endsWith('?') ||
    trimmedSidePanelSearch.split(/\s+/).length >= MINIMUM_QUESTION_WORD_COUNT;

  const getDefaultSelectedItemId = () => {
    if (!isSearchActive) {
      return undefined;
    }

    if (isDefined(firstCommandItemId)) {
      return firstCommandItemId;
    }

    if (isDefined(firstRecordItemId)) {
      return firstRecordItemId;
    }

    if (isInlineRecordSearchActive && isSearchingRecords) {
      return null;
    }

    if (shouldDisplayAskAiPrompt && doesSearchReadAsQuestion) {
      return COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID;
    }

    return null;
  };

  const defaultSelectedItemId = getDefaultSelectedItemId();

  const getSectionPreview = (section: DisplayedCommandMenuItemSection) =>
    getCommandMenuItemSectionPreview({
      section,
      sectionHeading: getSectionHeading(section),
      commandMenuItems: commandMenuItemsBySection[section].map((item) => ({
        label: interpolateCommandMenuItemFields(item, commandMenuContextApi)
          .label,
        creationTargetObjectMetadataId: item.creationTargetObjectMetadataId,
        navigationTargetObjectMetadataId: item.navigationTargetObjectMetadataId,
      })),
      objectMetadataItems,
    });

  const handleSeeMoreRecords = () => {
    setSidePanelSearchObjectFilter(null);
    navigateSidePanelMenu({
      page: SidePanelPages.SearchRecords,
      pageTitle: t`Search`,
      pageIcon: IconSearch,
    });
  };

  const renderSearchRows = () => (
    <>
      {renderSectionCommandRows('SEARCH')}
      {inlineSearchResultItems.map((item) => (
        <SidePanelSearchRecordItem key={item.id} item={item} />
      ))}
      {hasMoreSearchResultItems && (
        <SelectableListItem
          itemId={COMMAND_MENU_SEE_MORE_RECORDS_ITEM_ID}
          onEnter={handleSeeMoreRecords}
        >
          <CommandMenuItem
            id={COMMAND_MENU_SEE_MORE_RECORDS_ITEM_ID}
            label={t`See more results`}
            Icon={IconArrowRight}
            onClick={handleSeeMoreRecords}
          />
        </SelectableListItem>
      )}
      {shouldDisplayNoRecordsFound && (
        <CommandMenuItem
          id={COMMAND_MENU_NO_RECORDS_FOUND_ITEM_ID}
          label={t`No records found`}
          Icon={IconSearchOff}
          disabled
        />
      )}
      {displayedFallbackCommandMenuItems.map((item) => (
        <CommandMenuItemRenderer item={item} key={item.id} />
      ))}
    </>
  );

  const renderSectionCommandRows = (section: CommandMenuItemSection) => (
    <>
      {commandMenuItemsBySection[section].map((item) => (
        <CommandMenuItemRenderer item={item} key={item.id} />
      ))}
      {(section === 'THIS_OBJECT' || section === 'SELECTION') && (
        <CoreObjectsCommands section={section} />
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
    </>
  );

  const renderSectionRows = (section: DisplayedCommandMenuItemSection) => {
    if (section === 'ASK_AI' && shouldDisplayAskAiPrompt) {
      return (
        <>
          <CommandMenuAskAiFallbackItem
            prompt={trimmedSidePanelSearch}
            isDefaultSelection={
              defaultSelectedItemId === COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID
            }
          />
          {renderSectionCommandRows(section)}
        </>
      );
    }

    if (section === 'SEARCH' && isSearchActive) {
      return renderSearchRows();
    }

    return renderSectionCommandRows(section);
  };

  return (
    <>
      <ToastOnQueryErrorEffect error={searchRecordsError} />
      <SidePanelList
        selectableItemIds={selectableItemIds}
        defaultSelectedItemId={defaultSelectedItemId}
      >
        {displayedSections.map((section) => {
          const heading = getSectionHeading(section);

          return (
            <CommandMenuItemSectionGroup
              heading={heading}
              Icon={SECTION_ICONS[section]}
              context={getSectionContext(section)}
              collapsible={
                COLLAPSIBLE_SECTIONS.includes(section)
                  ? {
                      headerItemId: getSectionHeaderItemId(section),
                      isOpen: isSectionOpen(section),
                      preview: getSectionPreview(section),
                      onToggle: () =>
                        setSectionOpen({
                          section,
                          isOpen: !isSectionOpen(section),
                        }),
                    }
                  : undefined
              }
              key={section}
            >
              {renderSectionRows(section)}
            </CommandMenuItemSectionGroup>
          );
        })}
      </SidePanelList>
    </>
  );
};
