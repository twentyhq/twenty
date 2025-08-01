import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useDeleteWorkflowVersionEdge } from '@/workflow/workflow-steps/hooks/useDeleteWorkflowVersionEdge';
import { useState } from 'react';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';

export const useDeleteEdge = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const { deleteWorkflowVersionEdge } = useDeleteWorkflowVersionEdge();

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();

  const deleteEdge = async ({
    source,
    target,
  }: {
    source: string;
    target: string;
  }) => {
    if (isLoading === true) {
      return;
    }

    setIsLoading(true);

    try {
      const workflowVersionId = await getUpdatableWorkflowVersion(workflow);

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
