import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useCreateWorkflowVersionEdge } from '@/workflow/workflow-steps/hooks/useCreateWorkflowVersionEdge';
import { useState } from 'react';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';

export const useCreateEdge = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const { createWorkflowVersionEdge } = useCreateWorkflowVersionEdge();

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();

  const createEdge = async ({
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
