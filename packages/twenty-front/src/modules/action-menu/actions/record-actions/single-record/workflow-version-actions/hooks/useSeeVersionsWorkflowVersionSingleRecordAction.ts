import { useSeeVersionsWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeVersionsWorkflowSingleRecordAction';
import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useSeeVersionsWorkflowVersionSingleRecordAction: ActionHookWithoutObjectMetadataItem =
  ({ recordIds }) => {
    const recordId = recordIds[0];

    const workflowVersion = useRecoilValue(recordStoreFamilyState(recordId));

    if (!isDefined(workflowVersion)) {
      throw new Error('Workflow version not found');
    }

    const { shouldBeRegistered, onClick } =
      useSeeVersionsWorkflowSingleRecordAction({
        recordIds: [workflowVersion.workflow.id],
      });

    return {
      shouldBeRegistered,
      onClick,
    };
  };
