import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagramEdge';
import { useCreateWorkflowVersionEdge } from '@/workflow/workflow-steps/hooks/useCreateWorkflowVersionEdge';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useCreateEdge = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { createWorkflowVersionEdge } = useCreateWorkflowVersionEdge();

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();

  const createEdge = async ({ source, target }: WorkflowDiagramEdge) => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const workflowVersionId = await getUpdatableWorkflowVersion();

      if (!isDefined(workflowVersionId)) {
        throw new Error('Cannot find a workflow version to update');
      }

      const createdEdge = (
        await createWorkflowVersionEdge({
          workflowVersionId,
          source,
          target,
        })
      )?.data?.createWorkflowVersionEdge;

      if (!createdEdge) {
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { createEdge };
};
