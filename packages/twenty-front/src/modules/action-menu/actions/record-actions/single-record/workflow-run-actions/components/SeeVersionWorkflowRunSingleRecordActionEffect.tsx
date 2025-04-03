import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useActionEffect } from '@/action-menu/hooks/useActionEffect';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { AppPath } from '@/types/AppPath';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const SeeVersionWorkflowRunSingleRecordActionEffect = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const workflowRun = useRecoilValue(recordStoreFamilyState(recordId));
  const navigateApp = useNavigateApp();

  useActionEffect(() => {
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
  }, [navigateApp, workflowRun]);

  return null;
};
