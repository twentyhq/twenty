import { resolveCommandMenuItemComponent } from '@/command-menu-item/server-items/utils/resolveCommandMenuItemComponent';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useOpenFrontComponentInSidePanel } from '@/side-panel/hooks/useOpenFrontComponentInSidePanel';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { useCallback } from 'react';
import { type CommandMenuContextApi } from 'twenty-shared/types';
import {
  evaluateConditionalAvailabilityExpression,
  interpolateCommandMenuItemLabel,
  isDefined,
} from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

const resolveScope = (
  availabilityType: CommandMenuItemAvailabilityType,
): CommandMenuItemScope => {
  if (availabilityType === CommandMenuItemAvailabilityType.RECORD_SELECTION) {
    return CommandMenuItemScope.RecordSelection;
  }
  return CommandMenuItemScope.Global;
};

const resolveType = (
  item: CommandMenuItemFieldsFragment,
): CommandMenuItemType => {
  if (item.availabilityType === CommandMenuItemAvailabilityType.FALLBACK) {
    return CommandMenuItemType.Fallback;
  }
  if (isDefined(item.engineComponentKey)) {
    return CommandMenuItemType.Standard;
  }
  if (isDefined(item.frontComponentId)) {
    return CommandMenuItemType.FrontComponent;
  }
  if (isDefined(item.workflowVersionId)) {
    return CommandMenuItemType.WorkflowRun;
  }
  return CommandMenuItemType.Standard;
};

export const useConvertBackendItemToCommandMenuItemConfig = () => {
  const { getIcon } = useIcons();
  const { openFrontComponentInSidePanel } = useOpenFrontComponentInSidePanel();

  const contextStoreIsPageInEditMode = useAtomComponentStateValue(
    contextStoreIsPageInEditModeComponentState,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const currentObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === contextStoreCurrentObjectMetadataItemId,
  );

  const selectedRecordIds =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds
      : [];

  const hasRecordSelection =
    selectedRecordIds.length >= 1 ||
    contextStoreTargetedRecordsRule.mode === 'exclusion';

  const recordId =
    selectedRecordIds.length === 1 ? selectedRecordIds[0] : undefined;

  const objectNameSingular = currentObjectMetadataItem?.nameSingular;

  const convertBackendItemToCommandMenuItemConfig = useCallback(
    (
      item: CommandMenuItemFieldsFragment,
      commandMenuContextApi: CommandMenuContextApi,
      workflowVersionById: Map<
        string,
        Pick<WorkflowVersion, 'id' | 'workflowId' | 'trigger'>
      >,
    ) => {
      const scope = resolveScope(item.availabilityType);

      if (scope === CommandMenuItemScope.RecordSelection && !hasRecordSelection) {
        return null;
      }

      const isPinned =
        item.availabilityType !== CommandMenuItemAvailabilityType.FALLBACK &&
        !contextStoreIsPageInEditMode &&
        item.isPinned;

      const Icon = getIcon(item.icon, COMMAND_MENU_DEFAULT_ICON);

      const label = interpolateCommandMenuItemLabel({
        label: item.label,
        context: commandMenuContextApi,
      });

      const shortLabel = interpolateCommandMenuItemLabel({
        label: item.shortLabel,
        context: commandMenuContextApi,
      });

      const component = resolveCommandMenuItemComponent({
        item,
        displayLabel: label,
        Icon,
        openFrontComponentInSidePanel,
        recordId,
        objectNameSingular,
        workflowVersionById,
      });

      if (!isDefined(component)) {
        return;
      }

      return {
        type: resolveType(item),
        key: `command-menu-item-${item.id}`,
        scope,
        label,
        shortLabel,
        position: item.position,
        isPinned,
        Icon,
        hotKeys: item.hotKeys,
        shouldBeRegistered: () =>
          evaluateConditionalAvailabilityExpression(
            item.conditionalAvailabilityExpression,
            commandMenuContextApi,
          ),
        component,
      };
    },
    [
      getIcon,
      openFrontComponentInSidePanel,
      contextStoreIsPageInEditMode,
      hasRecordSelection,
      recordId,
      objectNameSingular,
    ],
  );

  return { convertBackendItemToCommandMenuItemConfig };
};
