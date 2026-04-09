import { FrontComponentCommandMenuItem } from '@/command-menu-item/display/components/FrontComponentCommandMenuItem';
import { HeadlessCommandMenuItem } from '@/command-menu-item/display/components/HeadlessCommandMenuItem';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
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
  EngineComponentKey,
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

  switch (item.engineComponentKey) {
    case EngineComponentKey.FRONT_COMPONENT_RENDERER:
      return CommandMenuItemType.FrontComponent;
    case EngineComponentKey.TRIGGER_WORKFLOW_VERSION:
      return CommandMenuItemType.WorkflowRun;
    default:
      return CommandMenuItemType.Standard;
  }
};

// TODO: Remove this hook once we finish refactoring and we use
// the new types to build command menu items.
export const useConvertBackendItemToCommandMenuItemConfig = () => {
  const { getIcon } = useIcons();

  const contextStoreIsPageInEditMode = useAtomComponentStateValue(
    contextStoreIsPageInEditModeComponentState,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const selectedRecordIds =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds
      : [];

  const hasRecordSelection =
    selectedRecordIds.length >= 1 ||
    contextStoreTargetedRecordsRule.mode === 'exclusion';

  const convertBackendItemToCommandMenuItemConfig = useCallback(
    (
      item: CommandMenuItemFieldsFragment,
      commandMenuContextApi: CommandMenuContextApi,
    ) => {
      const scope = resolveScope(item.availabilityType);

      if (
        scope === CommandMenuItemScope.RecordSelection &&
        !hasRecordSelection
      ) {
        return null;
      }

      const isEditModeItem =
        item.conditionalAvailabilityExpression?.includes('isPageInEditMode') ??
        false;

      const isPinned =
        item.availabilityType !== CommandMenuItemAvailabilityType.FALLBACK &&
        (!contextStoreIsPageInEditMode || isEditModeItem) &&
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

      const component = (() => {
        if (
          item.engineComponentKey ===
            EngineComponentKey.FRONT_COMPONENT_RENDERER &&
          isDefined(item.frontComponentId) &&
          item.frontComponent?.isHeadless !== true
        ) {
          return (
            <FrontComponentCommandMenuItem
              frontComponentId={item.frontComponentId}
            />
          );
        }

        return <HeadlessCommandMenuItem item={item} />;
      })();

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
    [getIcon, contextStoreIsPageInEditMode, hasRecordSelection],
  );

  return { convertBackendItemToCommandMenuItemConfig };
};
