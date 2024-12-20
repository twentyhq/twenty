import { useSeeVersionsWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeVersionsWorkflowSingleRecordAction';
import { SingleRecordActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/SingleRecordActionHook';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useSeeVersionsWorkflowVersionSingleRecordAction: SingleRecordActionHookWithoutObjectMetadataItem =
  ({ recordId }) => {
    const workflowVersion = useRecoilValue(recordStoreFamilyState(recordId));

    if (!isDefined(workflowVersion)) {
      throw new Error('Workflow version not found');
    }

    const { shouldBeRegistered, onClick } =
      useSeeVersionsWorkflowSingleRecordAction({
        recordId: workflowVersion.workflow.id,
      });

    return {
      shouldBeRegistered,
      onClick,
    };
  };
