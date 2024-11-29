import { useSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-ui';

export const useWorkflowVersionsSingleRecordActions = () => {
  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const selectedRecordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
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

  const registerSingleRecordActions = ({
    startPosition = 3,
  }: {
    startPosition?: number;
  }) => {
    registerSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction({
      position: startPosition,
    });
  };

  const unregisterSingleRecordActions = () => {
    unregisterSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction();
  };

  return {
    registerSingleRecordActions,
    unregisterSingleRecordActions,
  };
};
