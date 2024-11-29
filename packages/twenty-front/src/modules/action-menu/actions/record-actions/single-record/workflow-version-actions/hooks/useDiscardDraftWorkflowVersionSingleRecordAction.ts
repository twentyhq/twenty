import { useDiscardDraftWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDiscardWorkflowDraftWorkflowSingleRecordAction';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useDiscardDraftWorkflowVersionSingleRecordAction = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const workflowVersion = useRecoilValue(
    recordStoreFamilyState(workflowVersionId),
  );

  const {
    registerDiscardDraftWorkflowSingleRecordAction,
    unregisterDiscardDraftWorkflowSingleRecordAction,
  } = useDiscardDraftWorkflowSingleRecordAction({
    workflowId: workflowVersion?.workflow.id,
  });

  const registerDiscardDraftWorkflowVersionSingleRecordAction = ({
    position,
  }: {
    position: number;
  }) => {
    if (!isDefined(workflowVersion) || workflowVersion.status !== 'DRAFT') {
      return;
    }

    registerDiscardDraftWorkflowSingleRecordAction({ position });
  };

  const unregisterDiscardDraftWorkflowVersionSingleRecordAction = () => {
    unregisterDiscardDraftWorkflowSingleRecordAction();
  };

  return {
    registerDiscardDraftWorkflowVersionSingleRecordAction,
    unregisterDiscardDraftWorkflowVersionSingleRecordAction,
  };
};
