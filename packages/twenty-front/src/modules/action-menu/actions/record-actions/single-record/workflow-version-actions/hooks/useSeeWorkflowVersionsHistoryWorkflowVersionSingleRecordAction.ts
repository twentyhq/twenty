import { useSeeWorkflowVersionsHistorySingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowVersionsHistorySingleRecordAction';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilValue } from 'recoil';

export const useSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const workflowVersion = useRecoilValue(
    recordStoreFamilyState(workflowVersionId),
  );

  const {
    registerSeeWorkflowVersionsHistorySingleRecordAction:
      registerSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction,
    unregisterSeeWorkflowVersionsHistorySingleRecordAction:
      unregisterSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction,
  } = useSeeWorkflowVersionsHistorySingleRecordAction({
    workflowId: workflowVersion?.workflow.id,
  });

  return {
    registerSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction,
    unregisterSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction,
  };
};
