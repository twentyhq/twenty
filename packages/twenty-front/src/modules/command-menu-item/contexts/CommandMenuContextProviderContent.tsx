import { useGlobalRecordCreationCommandMenuItems } from '@/command-menu-item/hooks/useGlobalRecordCreationCommandMenuItems';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
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
import { mergeGlobalRecordCreationCommandMenuItems } from '@/command-menu-item/utils/mergeGlobalRecordCreationCommandMenuItems';
import { useIsLayoutCustomizationAllowedOnCurrentPage } from '@/layout-customization/hooks/useIsLayoutCustomizationAllowedOnCurrentPage';
import {
  currentPageLayoutIdState,
  PageLayoutIdContext,
} from '@/page-layout/states/currentPageLayoutIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext, useMemo } from 'react';
import { type CommandMenuContextApi } from 'twenty-shared/types';
import { evaluateConditionalAvailabilityExpression } from 'twenty-shared/utils';
import { EngineComponentKey } from '~/generated-metadata/graphql';

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
  const commandMenuItemsDraft = useAtomStateValue(commandMenuItemsDraftState);
  const currentPageLayoutId = useAtomStateValue(currentPageLayoutIdState);
  const pageLayoutIdFromContext = useContext(PageLayoutIdContext);
  const effectivePageLayoutId =
    pageLayoutIdFromContext === undefined
      ? currentPageLayoutId
      : pageLayoutIdFromContext;

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
          item.engineComponentKey !==
            EngineComponentKey.EDIT_RECORD_PAGE_LAYOUT ||
          isLayoutCustomizationAllowedOnCurrentPage,
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
          commandMenuContextApi,
        ),
      )
      .map((item) =>
        resolveCommandMenuItemPinning(item, commandMenuContextApi),
      );

    return mergeGlobalRecordCreationCommandMenuItems({
      commandMenuItems: contextCommandMenuItems,
      globalRecordCreationCommandMenuItems,
      shouldDisplayGlobalRecordCreationCommands,
    });
  }, [
    commandMenuContextApi,
    globalRecordCreationCommandMenuItems,
    shouldDisplayGlobalRecordCreationCommands,
    commandMenuItems,
    commandMenuItemsDraft,
    effectivePageLayoutId,
    isInPreviewMode,
    isLayoutCustomizationAllowedOnCurrentPage,
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
