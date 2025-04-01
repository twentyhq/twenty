import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { AppPath } from '@/types/AppPath';
import { useRecoilValue } from 'recoil';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useSeeWorkflowWorkflowRunSingleRecordAction: ActionHookWithoutObjectMetadataItem =
  () => {
    const recordId = useSelectedRecordIdOrThrow();

    const workflowRun = useRecoilValue(recordStoreFamilyState(recordId));

    const navigateApp = useNavigateApp();

    const onClick = () => {
      if (!workflowRun?.workflow?.id) return;

      navigateApp(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: workflowRun.workflow.id,
      });
    };

    return {
      onClick,
    };
  };
