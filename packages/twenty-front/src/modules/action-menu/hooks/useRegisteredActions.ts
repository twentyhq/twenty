import { useRecordAgnosticActions } from '@/action-menu/actions/record-agnostic-actions/hooks/useRecordAgnosticActions';
import { useRelatedRecordActions } from '@/action-menu/actions/record-agnostic-actions/hooks/useRelatedRecordActions';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import { getActionConfig } from '@/action-menu/actions/utils/getActionConfig';
import { getActionViewType } from '@/action-menu/actions/utils/getActionViewType';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const useRegisteredActions = (
  shouldBeRegisteredParams: ShouldBeRegisteredFunctionParams,
) => {
  const { objectMetadataItem } = shouldBeRegisteredParams;

  const { getIcon } = useIcons();

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreCurrentViewType = useRecoilComponentValueV2(
    contextStoreCurrentViewTypeComponentState,
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

  const actionsToRegister = isDefined(viewType)
    ? Object.values(actionsConfig).filter(
        (action) =>
          action.availableOn?.includes(viewType) ||
          action.availableOn?.includes(ActionViewType.GLOBAL),
      )
    : [];

  const actions = actionsToRegister
    .filter((action) => action.shouldBeRegistered(shouldBeRegisteredParams))
    .sort((a, b) => a.position - b.position);

  return actions;
};
