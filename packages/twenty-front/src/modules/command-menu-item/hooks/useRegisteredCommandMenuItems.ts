import { useRecordAgnosticActions } from '@/command-menu-item/record-agnostic/hooks/useRecordAgnosticActions';
import { useRelatedRecordActions } from '@/command-menu-item/record-agnostic/hooks/useRelatedRecordActions';
import { CommandMenuItemViewType } from 'twenty-shared/types';
import { type ShouldBeRegisteredFunctionParams } from '@/command-menu-item/types/ShouldBeRegisteredFunctionParams';
import { getCommandMenuItemConfig } from '@/command-menu-item/utils/getCommandMenuItemConfig';
import { getCommandMenuItemViewType } from '@/command-menu-item/utils/getCommandMenuItemViewType';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const useRegisteredCommandMenuItems = (
  shouldBeRegisteredParams: ShouldBeRegisteredFunctionParams,
) => {
  const { objectMetadataItem } = shouldBeRegisteredParams;

  const { getIcon } = useIcons();

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreCurrentViewType = useAtomComponentStateValue(
    contextStoreCurrentViewTypeComponentState,
  );

  const contextStoreIsPageInEditMode = useAtomComponentStateValue(
    contextStoreIsPageInEditModeComponentState,
  );

  const viewType = getCommandMenuItemViewType(
    contextStoreCurrentViewType,
    contextStoreTargetedRecordsRule,
  );

  const recordActionConfig = getCommandMenuItemConfig({
    objectMetadataItem,
  });

  const relatedRecordActionConfig = useRelatedRecordActions({
    sourceObjectMetadataItem: objectMetadataItem,
    getIcon,
    startPosition: Object.keys(recordActionConfig).length + 1,
  });

  const recordAgnosticActionConfig = useRecordAgnosticActions();

  const actionsConfig = {
    ...recordActionConfig,
    ...relatedRecordActionConfig,
    ...recordAgnosticActionConfig,
  };

  const permissionMap = usePermissionFlagMap();

  const actionsToRegister = Object.values(actionsConfig).filter((action) => {
    if (contextStoreIsPageInEditMode) {
      return (
        isDefined(action.availableOn) &&
        action.availableOn.includes(CommandMenuItemViewType.PAGE_EDIT_MODE)
      );
    }

    if (isDefined(viewType)) {
      return (
        action.availableOn?.includes(viewType) ||
        action.availableOn?.includes(CommandMenuItemViewType.GLOBAL)
      );
    }

    return action.availableOn?.includes(CommandMenuItemViewType.GLOBAL);
  });

  const actions = actionsToRegister
    .filter((action) => {
      if (
        isDefined(action.requiredPermissionFlag) &&
        !permissionMap[action.requiredPermissionFlag]
      ) {
        return false;
      }
      return action.shouldBeRegistered(shouldBeRegisteredParams);
    })
    .sort((a, b) => a.position - b.position);

  return actions;
};
