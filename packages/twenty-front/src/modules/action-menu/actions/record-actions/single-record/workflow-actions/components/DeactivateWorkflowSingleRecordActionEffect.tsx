import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useDeactivateWorkflowVersion } from '@/workflow/hooks/useDeactivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const DeactivateWorkflowSingleRecordActionEffect = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { deactivateWorkflowVersion } = useDeactivateWorkflowVersion();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

  useEffect(() => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    deactivateWorkflowVersion({
      workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
    });
  }, [deactivateWorkflowVersion, workflowWithCurrentVersion]);

  return null;
};
