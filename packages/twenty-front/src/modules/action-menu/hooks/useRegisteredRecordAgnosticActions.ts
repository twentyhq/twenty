import { RECORD_AGNOSTIC_ACTIONS_CONFIG } from '@/action-menu/actions/record-agnostic-actions/constants/RecordAgnosticActionsConfig';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { getActionViewType } from '@/action-menu/actions/utils/getActionViewType';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

export const useRegisteredRecordAgnosticActions = () => {
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

  const actionsToRegister = isDefined(viewType)
    ? Object.values(RECORD_AGNOSTIC_ACTIONS_CONFIG ?? {}).filter(
        (action) =>
          action.availableOn?.includes(viewType) ||
          action.availableOn?.includes(ActionViewType.GLOBAL),
      )
    : [];

  const actions = actionsToRegister.filter((action) =>
    action.shouldBeRegistered({}),
  );

  return actions;
};
