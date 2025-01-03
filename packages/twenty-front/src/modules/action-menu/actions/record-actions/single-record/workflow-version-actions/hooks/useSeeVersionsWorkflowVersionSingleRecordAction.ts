import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useSeeVersionsWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeVersionsWorkflowSingleRecordAction';
import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useSeeVersionsWorkflowVersionSingleRecordAction: ActionHookWithoutObjectMetadataItem =
  () => {
    const recordId = useSelectedRecordIdOrThrow();

    const workflowVersion = useRecoilValue(recordStoreFamilyState(recordId));

    const workflowIds = isDefined(workflowVersion)
      ? [workflowVersion.workflowId]
      : undefined;

    // TODO: Add recordIds to the hook
    const { shouldBeRegistered, onClick } =
      useSeeVersionsWorkflowSingleRecordAction(workflowIds);

    return {
      shouldBeRegistered,
      onClick,
    };
  };
