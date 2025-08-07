import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useDeleteWorkflowVersionEdge } from '@/workflow/workflow-steps/hooks/useDeleteWorkflowVersionEdge';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagramEdge';

export const useDeleteEdge = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const { deleteWorkflowVersionEdge } = useDeleteWorkflowVersionEdge();

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();

  const deleteEdge = async ({ source, target }: WorkflowDiagramEdge) => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const workflowVersionId = await getUpdatableWorkflowVersion(workflow);

      if (!isDefined(workflowVersionId)) {
        throw new Error('Cannot find a workflow version to update');
      }

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
