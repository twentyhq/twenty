import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { type WorkflowVersion } from '@/workflow/types/Workflow';

export type WorkflowVersionContent = {
  workflowVersionId: string;
  trigger: WorkflowVersion['trigger'];
  steps: WorkflowVersion['steps'];
};

export const useWorkflowVersionContent = (workflowVersionId?: string) => {
  const { coreWorkflowVersion, loading, error, refetchCoreWorkflowVersion } =
    useCoreWorkflowVersion(workflowVersionId);

  const content = useMemo<WorkflowVersionContent | undefined>(
    () =>
      isDefined(coreWorkflowVersion)
        ? {
            workflowVersionId: coreWorkflowVersion.id,
            trigger: coreWorkflowVersion.trigger,
            steps: coreWorkflowVersion.steps,
          }
        : undefined,
    [coreWorkflowVersion],
  );

  return {
    content,
    loading,
    refetchContent: refetchCoreWorkflowVersion,
    contentUpdatedAt: coreWorkflowVersion?.updatedAt,
    error,
  };
};
