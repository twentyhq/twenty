import { useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction';
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
    registerSeeWorkflowVersionsHistoryWorkflowSingleRecordAction:
      registerSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction,
    unregisterSeeWorkflowVersionsHistoryWorkflowSingleRecordAction:
      unregisterSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction,
  } = useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction({
    workflowId: workflowVersion?.workflow.id,
  });

  return {
    registerSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction,
    unregisterSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction,
  };
};
