import { useRecordAgnosticActions } from '@/action-menu/actions/record-agnostic-actions/hooks/useRecordAgnosticActions';
import { useRelatedRecordActions } from '@/action-menu/actions/record-agnostic-actions/hooks/useRelatedRecordActions';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { type ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import { getActionConfig } from '@/action-menu/actions/utils/getActionConfig';
import { getActionViewType } from '@/action-menu/actions/utils/getActionViewType';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const useRegisteredActions = (
  shouldBeRegisteredParams: ShouldBeRegisteredFunctionParams,
) => {
  const { objectMetadataItem, forceRegisteredActionsByKey } =
    shouldBeRegisteredParams;

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

  const viewType = getActionViewType(
    contextStoreCurrentViewType,
    contextStoreTargetedRecordsRule,
  );

  const recordActionConfig = getActionConfig({
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
        action.availableOn.includes(ActionViewType.PAGE_EDIT_MODE)
      );
    }

    if (isDefined(viewType)) {
      return (
        action.availableOn?.includes(viewType) ||
        action.availableOn?.includes(ActionViewType.GLOBAL)
      );
    }

    return action.availableOn?.includes(ActionViewType.GLOBAL);
  });

  const actions = actionsToRegister
    .filter((action) => {
      if (
        isDefined(action.requiredPermissionFlag) &&
        !permissionMap[action.requiredPermissionFlag]
      ) {
        return false;
      }
      const forcedShouldBeRegistered = forceRegisteredActionsByKey[action.key];

      if (isDefined(forcedShouldBeRegistered)) {
        return (
          forcedShouldBeRegistered &&
          action.shouldBeRegistered(shouldBeRegisteredParams)
        );
      }

      return action.shouldBeRegistered(shouldBeRegisteredParams);
    })
    .sort((a, b) => a.position - b.position);

  return actions;
};
