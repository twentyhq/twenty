import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { type WorkflowDiagramEdgeDescriptor } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeDescriptor';
import { type WorkflowStepConnectionOptions } from '@/workflow/workflow-diagram/workflow-iterator/types/WorkflowStepConnectionOptions';
import { useCreateWorkflowVersionEdge } from '@/workflow/workflow-steps/hooks/useCreateWorkflowVersionEdge';
import { useState } from 'react';

type CreateEdgeParams = Pick<
  WorkflowDiagramEdgeDescriptor,
  'source' | 'target'
> & {
  connectionOptions?: WorkflowStepConnectionOptions;
};

export const useCreateEdge = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { createWorkflowVersionEdge } = useCreateWorkflowVersionEdge();

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();

  const createEdge = async ({
    source,
    target,
    connectionOptions,
  }: CreateEdgeParams) => {
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
          sourceConnectionOptions: connectionOptions,
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
