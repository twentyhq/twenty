import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useActionEffect } from '@/action-menu/hooks/useActionEffect';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { AppPath } from '@/types/AppPath';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const SeeWorkflowWorkflowVersionSingleRecordActionEffect = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const workflowVersion = useRecoilValue(recordStoreFamilyState(recordId));
  const navigateApp = useNavigateApp();

  useActionEffect(() => {
    if (
      !isDefined(workflowVersion) ||
      !isDefined(workflowVersion?.workflow?.id)
    ) {
      return;
    }

    navigateApp(AppPath.RecordShowPage, {
      objectNameSingular: CoreObjectNameSingular.Workflow,
      objectRecordId: workflowVersion.workflow.id,
    });
  }, [navigateApp, workflowVersion]);

  return null;
};
