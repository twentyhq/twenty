import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { type WorkflowDiagramEdgeDescriptor } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeDescriptor';
import { useDeleteWorkflowVersionEdge } from '@/workflow/workflow-steps/hooks/useDeleteWorkflowVersionEdge';
import { useState } from 'react';

export const useDeleteEdge = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { deleteWorkflowVersionEdge } = useDeleteWorkflowVersionEdge();

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();

  const deleteEdge = async ({
    source,
    target,
  }: WorkflowDiagramEdgeDescriptor) => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const workflowVersionId = await getUpdatableWorkflowVersion();

      const deletedEdge = (
        await deleteWorkflowVersionEdge({
          workflowVersionId,
          source,
          target,
        })
      )?.data?.deleteWorkflowVersionEdge;

      if (!deletedEdge) {
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteEdge };
};
