import { useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction';
import { SingleRecordActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/singleRecordActionHook';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useSeeWorkflowVersionsHistoryWorkflowVersionSingleRecordAction: SingleRecordActionHookWithoutObjectMetadataItem =
  ({ recordId }) => {
    const workflowVersion = useRecoilValue(recordStoreFamilyState(recordId));

    if (!isDefined(workflowVersion)) {
      throw new Error('Workflow version not found');
    }

    const { shouldBeRegistered, onClick } =
      useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction({
        recordId: workflowVersion.workflow.id,
      });

    return {
      shouldBeRegistered,
      onClick,
    };
  };
