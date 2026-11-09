import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { WidgetCommandMenuItemButtons } from '@/command-menu-item/components/WidgetCommandMenuItemButtons';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { recordShowPageWidgetHeaderCommandMenuItemsState } from '@/command-menu-item/states/recordShowPageWidgetHeaderCommandMenuItemsState';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemEditButton } from '@/command-menu-item/edit/components/CommandMenuItemEditButton';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentCoreObjectNameComponentState } from '@/context-store/states/contextStoreCurrentCoreObjectNameComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordShowCommandMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const contextStoreCurrentCoreObjectName = useAtomComponentStateValue(
    contextStoreCurrentCoreObjectNameComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const hasSelectedRecord =
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length === 1;

  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const recordShowPageWidgetHeaderCommandMenuItems = useAtomStateValue(
    recordShowPageWidgetHeaderCommandMenuItemsState,
  );

  const widgetCommandMenuItems = isLayoutCustomizationModeEnabled
    ? []
    : recordShowPageWidgetHeaderCommandMenuItems;

  const replacedEngineComponentKey = widgetCommandMenuItems.find(
    (commandMenuItem) => commandMenuItem.isPinned !== false,
  )?.replacedEngineComponentKey;

  return (
    <>
      {hasSelectedRecord &&
        (isDefined(contextStoreCurrentObjectMetadataItemId) ||
          isDefined(contextStoreCurrentCoreObjectName)) && (
          <>
            <CommandMenuContextProvider
              displayType="button"
              containerType={CommandMenuItemContainerType.ShowPageHeader}
              isInPreviewMode={isLayoutCustomizationModeEnabled}
            >
              <PinnedCommandMenuItemButtons
                hiddenEngineComponentKey={replacedEngineComponentKey}
              />
            </CommandMenuContextProvider>
            <WidgetCommandMenuItemButtons
              commandMenuItems={widgetCommandMenuItems}
            />
            <CommandMenuItemEditButton />
          </>
        )}
    </>
  );
};
