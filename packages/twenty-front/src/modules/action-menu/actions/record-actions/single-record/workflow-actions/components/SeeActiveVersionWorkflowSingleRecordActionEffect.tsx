import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useActionEffect } from '@/action-menu/hooks/useActionEffect';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { AppPath } from '@/types/AppPath';
import { useActiveWorkflowVersion } from '@/workflow/hooks/useActiveWorkflowVersion';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const SeeActiveVersionWorkflowSingleRecordActionEffect = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const workflowActiveVersion = useActiveWorkflowVersion(recordId);

  const navigateApp = useNavigateApp();

  useActionEffect(() => {
    if (!isDefined(workflowActiveVersion)) {
      return;
    }

    navigateApp(AppPath.RecordShowPage, {
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
      objectRecordId: workflowActiveVersion.id,
    });
  }, [navigateApp, workflowActiveVersion]);

  return null;
};
