import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const TestWorkflowSingleRecordActionEffect = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { runWorkflowVersion } = useRunWorkflowVersion();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

  useEffect(() => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    runWorkflowVersion({
      workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
    });
  }, [runWorkflowVersion, workflowWithCurrentVersion]);

  return null;
};
