import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { type WorkflowStepConnectionOptions } from '@/workflow/workflow-diagram/workflow-iterator/types/WorkflowStepConnectionOptions';
import { useDeleteWorkflowVersionEdge } from '@/workflow/workflow-steps/hooks/useDeleteWorkflowVersionEdge';
import { useState } from 'react';

type DeleteEdgeParams = {
  source: string;
  target: string;
  sourceConnectionOptions?: WorkflowStepConnectionOptions;
};

export const useDeleteEdge = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { deleteWorkflowVersionEdge } = useDeleteWorkflowVersionEdge();

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();

  const deleteEdge = async ({
    source,
    target,
    sourceConnectionOptions,
  }: DeleteEdgeParams) => {
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
          sourceConnectionOptions,
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
