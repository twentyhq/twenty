import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { AppPath } from '@/types/AppPath';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useSeeVersionWorkflowRunSingleRecordAction: ActionHookWithoutObjectMetadataItem =
  () => {
    const recordId = useSelectedRecordIdOrThrow();

    const workflowRun = useRecoilValue(recordStoreFamilyState(recordId));

    const navigateApp = useNavigateApp();

    const onClick = () => {
      if (
        !isDefined(workflowRun) ||
        !isDefined(workflowRun?.workflowVersion?.id)
      ) {
        return;
      }

      navigateApp(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        objectRecordId: workflowRun.workflowVersion.id,
      });
    };

    return {
      onClick,
    };
  };
