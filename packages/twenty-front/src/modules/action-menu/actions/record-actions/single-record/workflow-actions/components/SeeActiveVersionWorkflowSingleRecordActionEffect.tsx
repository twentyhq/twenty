import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { AppPath } from '@/types/AppPath';
import { useActiveWorkflowVersion } from '@/workflow/hooks/useActiveWorkflowVersion';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const SeeActiveVersionWorkflowSingleRecordActionEffect = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const workflowActiveVersion = useActiveWorkflowVersion(recordId);

  const navigateApp = useNavigateApp();

  useEffect(() => {
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
