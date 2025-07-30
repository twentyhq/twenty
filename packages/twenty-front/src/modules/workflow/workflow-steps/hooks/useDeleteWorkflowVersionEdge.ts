import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useMutation } from '@apollo/client';
import { WorkflowVersionEdgeInput } from '~/generated/graphql';
import { DELETE_WORKFLOW_VERSION_EDGE } from '@/workflow/graphql/mutations/deleteWorkflowVersionEdge';
import {
  DeleteWorkflowVersionEdgeMutation,
  DeleteWorkflowVersionEdgeMutationVariables,
} from '~/generated-metadata/graphql';
import { useWorkflowVersionStepUpdateCache } from '@/workflow/workflow-steps/hooks/useWorkflowVersionStepUpdateCache';

export const useDeleteWorkflowVersionEdge = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { updateCache } = useWorkflowVersionStepUpdateCache();

  const [mutate] = useMutation<
    DeleteWorkflowVersionEdgeMutation,
    DeleteWorkflowVersionEdgeMutationVariables
  >(DELETE_WORKFLOW_VERSION_EDGE, { client: apolloCoreClient });

  const deleteWorkflowVersionEdge = async (input: WorkflowVersionEdgeInput) => {
    const result = await mutate({ variables: { input } });

    const workflowVersionStepUpdates = result?.data?.deleteWorkflowVersionEdge;

    updateCache({
      workflowVersionStepUpdates,
      workflowVersionId: input.workflowVersionId,
    });

    return result;
  };

  return { deleteWorkflowVersionEdge };
};
