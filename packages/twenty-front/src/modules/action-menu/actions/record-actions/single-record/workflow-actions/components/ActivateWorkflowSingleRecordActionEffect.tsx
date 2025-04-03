import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const ActivateWorkflowSingleRecordActionEffect = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { activateWorkflowVersion } = useActivateWorkflowVersion();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

  useEffect(() => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    activateWorkflowVersion({
      workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
      workflowId: workflowWithCurrentVersion.id,
    });
  }, [activateWorkflowVersion, workflowWithCurrentVersion]);

  return null;
};
