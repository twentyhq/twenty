import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { AppPath } from '@/types/AppPath';
import { useRecoilValue } from 'recoil';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useSeeWorkflowWorkflowVersionSingleRecordAction: ActionHookWithoutObjectMetadataItem =
  () => {
    const recordId = useSelectedRecordIdOrThrow();

    const workflowVersion = useRecoilValue(recordStoreFamilyState(recordId));

    const navigateApp = useNavigateApp();

    const onClick = () => {
      if (!workflowVersion?.workflow?.id) {
        return;
      }

      navigateApp(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: workflowVersion.workflow.id,
      });
    };

    return {
      onClick,
    };
  };
