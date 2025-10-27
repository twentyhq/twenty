import { Action } from '@/action-menu/actions/components/Action';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useStopWorkflowRun } from '@/workflow/hooks/useStopWorkflowRun';

export const StopWorkflowRunSingleRecordAction = () => {
  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  if (
    contextStoreTargetedRecordsRule.mode === 'exclusion' ||
    (contextStoreTargetedRecordsRule.mode === 'selection' &&
      contextStoreTargetedRecordsRule.selectedRecordIds.length === 0)
  ) {
    throw new Error('Selected record ID is required');
  }

  const selectedRecordIds = contextStoreTargetedRecordsRule.selectedRecordIds;
  const { stopWorkflowRun } = useStopWorkflowRun();

  const handleClick = async () => {
    for (const selectedRecordId of selectedRecordIds) {
      await stopWorkflowRun(selectedRecordId);
    }
  };

  return <Action onClick={handleClick} />;
};
