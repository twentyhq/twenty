import { useSeeWorkflowExecutionsWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useSeeWorkflowExecutionsWorkflowVersionSingleRecordAction';
import { useSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction';
import { useUseAsDraftWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useUseAsDraftWorkflowVersionSingleRecordAction';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-ui';

export const useWorkflowVersionsSingleRecordActions = () => {
  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const selectedRecordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds?.[0]
      : undefined;

  if (!isDefined(selectedRecordId)) {
    throw new Error('Selected record ID is required');
  }

  const {
    registerSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction,
    unregisterSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction,
  } = useSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction({
    workflowVersionId: selectedRecordId,
  });

  const {
    registerUseAsDraftWorkflowVersionSingleRecordAction,
    unregisterUseAsDraftWorkflowVersionSingleRecordAction,
  } = useUseAsDraftWorkflowVersionSingleRecordAction({
    workflowVersionId: selectedRecordId,
  });

  const {
    registerSeeWorkflowExecutionsWorkflowVersionSingleRecordAction,
    unregisterSeeWorkflowExecutionsWorkflowVersionSingleRecordAction,
  } = useSeeWorkflowExecutionsWorkflowVersionSingleRecordAction({
    workflowVersionId: selectedRecordId,
  });

  const registerSingleRecordActions = ({
    startPosition,
  }: {
    startPosition: number;
  }) => {
    registerUseAsDraftWorkflowVersionSingleRecordAction({
      position: startPosition,
    });
    registerSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction({
      position: startPosition + 1,
    });

    registerSeeWorkflowExecutionsWorkflowVersionSingleRecordAction({
      position: startPosition + 2,
    });
  };

  const unregisterSingleRecordActions = () => {
    unregisterUseAsDraftWorkflowVersionSingleRecordAction();
    unregisterSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction();
    unregisterSeeWorkflowExecutionsWorkflowVersionSingleRecordAction();
  };

  return {
    registerSingleRecordActions,
    unregisterSingleRecordActions,
  };
};
