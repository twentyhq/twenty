import { useGlobalRecordCreationCommandMenuItems } from '@/command-menu-item/hooks/useGlobalRecordCreationCommandMenuItems';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import {
  CommandMenuContext,
  type CommandMenuContextType,
} from '@/command-menu-item/contexts/CommandMenuContext';
import { commandMenuItemsDraftState } from '@/command-menu-item/edit/states/commandMenuItemsDraftState';
import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { doesCommandMenuItemMatchObjectMetadataId } from '@/command-menu-item/utils/doesCommandMenuItemMatchObjectMetadataId';
import { doesCommandMenuItemMatchPageLayoutId } from '@/command-menu-item/utils/doesCommandMenuItemMatchPageLayoutId';
import { resolveCommandMenuItemPinning } from '@/command-menu-item/utils/resolveCommandMenuItemPinning';
import { doesCommandMenuItemMatchPageType } from '@/command-menu-item/utils/doesCommandMenuItemMatchPageType';
import { doesCommandMenuItemMatchSelectionState } from '@/command-menu-item/utils/doesCommandMenuItemMatchSelectionState';
import { getCommandMenuContextApiForContainerType } from '@/command-menu-item/utils/getCommandMenuContextApiForContainerType';
import { mergeGlobalRecordCreationCommandMenuItems } from '@/command-menu-item/utils/mergeGlobalRecordCreationCommandMenuItems';
import { useIsLayoutCustomizationAllowedOnCurrentPage } from '@/layout-customization/hooks/useIsLayoutCustomizationAllowedOnCurrentPage';
import { useIsLogConsoleAllowed } from '@/log-console/hooks/useIsLogConsoleAllowed';
import {
  currentPageLayoutIdState,
  PageLayoutIdContext,
} from '@/page-layout/states/currentPageLayoutIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext, useMemo } from 'react';
import { isString } from '@sniptt/guards';
import {
  ContextStorePageType,
  CoreObjectNameSingular,
  type CommandMenuContextApi,
} from 'twenty-shared/types';
import { evaluateConditionalAvailabilityExpression } from 'twenty-shared/utils';
import { EngineComponentKey } from '~/generated-metadata/graphql';

const WORKSPACE_DEFINITION_COMMANDS = new Set<EngineComponentKey>([
  EngineComponentKey.ADD_TO_FAVORITES,
  EngineComponentKey.REMOVE_FROM_FAVORITES,
  EngineComponentKey.EDIT_RECORD_PAGE_LAYOUT,
  EngineComponentKey.EXPORT_RECORDS,
  EngineComponentKey.EXPORT_FROM_RECORD_INDEX,
  EngineComponentKey.EXPORT_VIEW,
  EngineComponentKey.IMPORT_RECORDS,
  EngineComponentKey.SEE_DELETED_RECORDS,
  EngineComponentKey.CREATE_NEW_VIEW,
  EngineComponentKey.HIDE_DELETED_RECORDS,
  EngineComponentKey.EXPORT_FROM_RECORD_SHOW,
  EngineComponentKey.EXPORT_MULTIPLE_RECORDS,
  EngineComponentKey.UPDATE_MULTIPLE_RECORDS,
  EngineComponentKey.NAVIGATE_TO_NEXT_RECORD,
  EngineComponentKey.NAVIGATE_TO_PREVIOUS_RECORD,
]);

type CommandMenuContextProviderContentProps = {
  displayType: CommandMenuContextType['displayType'];
  containerType: CommandMenuContextType['containerType'];
  children: React.ReactNode;
  commandMenuContextApi: CommandMenuContextApi;
  isInPreviewMode: boolean;
};

export const CommandMenuContextProviderContent = ({
  displayType,
  containerType,
  children,
  commandMenuContextApi,
  isInPreviewMode,
}: CommandMenuContextProviderContentProps) => {
  const isCore = useIsWorkflowCoreEnabled();
  const isCoreWorkflow =
    isCore &&
    commandMenuContextApi.objectMetadataItem.nameSingular ===
      CoreObjectNameSingular.Workflow;
  const isCoreWorkflowIndex =
    isCoreWorkflow &&
    commandMenuContextApi.pageType === ContextStorePageType.Index;
  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);
  const {
    hasGlobalRecordCreationCommandTemplate,
    globalRecordCreationCommandMenuItems,
  } = useGlobalRecordCreationCommandMenuItems(commandMenuItems);
  const shouldDisplayGlobalRecordCreationCommands =
    containerType === CommandMenuItemContainerType.CommandMenuList &&
    hasGlobalRecordCreationCommandTemplate;
  const isLayoutCustomizationAllowedOnCurrentPage =
    useIsLayoutCustomizationAllowedOnCurrentPage();
  const isLogConsoleAllowed = useIsLogConsoleAllowed();
  const commandMenuItemsDraft = useAtomStateValue(commandMenuItemsDraftState);
  const currentPageLayoutId = useAtomStateValue(currentPageLayoutIdState);
  const pageLayoutIdFromContext = useContext(PageLayoutIdContext);
  const effectivePageLayoutId =
    pageLayoutIdFromContext === undefined
      ? currentPageLayoutId
      : pageLayoutIdFromContext;

  const commandMenuContextApiForAvailability = useMemo(
    () =>
      getCommandMenuContextApiForContainerType({
        commandMenuContextApi,
        containerType,
      }),
    [commandMenuContextApi, containerType],
  );

  const filteredCommandMenuItems = useMemo(() => {
    const currentObjectMetadataItemId =
      commandMenuContextApi.objectMetadataItem.id;
    const hasSelectedRecords =
      commandMenuContextApi.numberOfSelectedRecords > 0;
    const commandMenuItemsToDisplay = isInPreviewMode
      ? (commandMenuItemsDraft ?? commandMenuItems)
      : commandMenuItems;

    const contextCommandMenuItems = commandMenuItemsToDisplay
      .filter(
        (item) =>
          !isCoreWorkflowIndex ||
          item.engineComponentKey !== EngineComponentKey.DELETE_RECORDS,
      )
      .filter(
        (item) =>
          !isCoreWorkflow ||
          !WORKSPACE_DEFINITION_COMMANDS.has(item.engineComponentKey),
      )
      .filter(
        (item) =>
          item.engineComponentKey !==
            EngineComponentKey.EDIT_RECORD_PAGE_LAYOUT ||
          isLayoutCustomizationAllowedOnCurrentPage,
      )
      .filter(
        (item) =>
          item.engineComponentKey !== EngineComponentKey.OPEN_LOG_CONSOLE ||
          isLogConsoleAllowed,
      )
      .filter(
        doesCommandMenuItemMatchObjectMetadataId(currentObjectMetadataItemId),
      )
      .filter(doesCommandMenuItemMatchPageType(commandMenuContextApi.pageType))
      .filter(doesCommandMenuItemMatchSelectionState(hasSelectedRecords))
      .filter(doesCommandMenuItemMatchPageLayoutId(effectivePageLayoutId))
      .filter((item) =>
        evaluateConditionalAvailabilityExpression(
          item.conditionalAvailabilityExpression,
          commandMenuContextApiForAvailability,
        ),
      )
      .map((item) =>
        resolveCommandMenuItemPinning(
          item,
          commandMenuContextApiForAvailability,
        ),
      );

    return mergeGlobalRecordCreationCommandMenuItems({
      commandMenuItems: contextCommandMenuItems,
      contextObjectMetadataId: isString(currentObjectMetadataItemId)
        ? currentObjectMetadataItemId
        : undefined,
      globalRecordCreationCommandMenuItems,
      shouldDisplayGlobalRecordCreationCommands,
    });
  }, [
    commandMenuContextApi,
    commandMenuContextApiForAvailability,
    globalRecordCreationCommandMenuItems,
    shouldDisplayGlobalRecordCreationCommands,
    isCoreWorkflow,
    commandMenuItems,
    commandMenuItemsDraft,
    effectivePageLayoutId,
    isInPreviewMode,
    isLayoutCustomizationAllowedOnCurrentPage,
    isLogConsoleAllowed,
    isCoreWorkflowIndex,
  ]);

  return (
    <CommandMenuContext.Provider
      value={{
        displayType,
        containerType,
        commandMenuItems: filteredCommandMenuItems,
        commandMenuContextApi,
        isInPreviewMode,
      }}
    >
      {children}
    </CommandMenuContext.Provider>
  );
};
