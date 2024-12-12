import { useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction';
import { SingleRecordActionHook } from '@/action-menu/actions/types/singleRecordActionHook';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilValue } from 'recoil';

export const useSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction: SingleRecordActionHook =
  (recordId) => {
    const workflowVersion = useRecoilValue(recordStoreFamilyState(recordId));

    const { shouldBeRegistered, onClick } =
      useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction(
        workflowVersion?.workflow.id,
      );

    return {
      shouldBeRegistered,
      onClick,
    };
  };
