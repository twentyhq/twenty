import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdge';
import { useCreateWorkflowVersionEdge } from '@/workflow/workflow-steps/hooks/useCreateWorkflowVersionEdge';
import { useState } from 'react';

export const useCreateEdge = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { createWorkflowVersionEdge } = useCreateWorkflowVersionEdge();

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();

  const createEdge = async ({ source, target }: WorkflowDiagramEdge) => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const workflowVersionId = await getUpdatableWorkflowVersion();

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
