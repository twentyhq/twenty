import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useMutation } from '@apollo/client';
import { type CreateWorkflowVersionEdgeInput } from '~/generated/graphql';
import { DELETE_WORKFLOW_VERSION_EDGE } from '@/workflow/graphql/mutations/deleteWorkflowVersionEdge';
import {
  type DeleteWorkflowVersionEdgeMutation,
  type DeleteWorkflowVersionEdgeMutationVariables,
} from '~/generated-metadata/graphql';
import { useUpdateWorkflowVersionCache } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionCache';

export const useDeleteWorkflowVersionEdge = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { updateWorkflowVersionCache } = useUpdateWorkflowVersionCache();

  const [mutate] = useMutation<
    DeleteWorkflowVersionEdgeMutation,
    DeleteWorkflowVersionEdgeMutationVariables
  >(DELETE_WORKFLOW_VERSION_EDGE, { client: apolloCoreClient });

  const deleteWorkflowVersionEdge = async (
    input: CreateWorkflowVersionEdgeInput,
  ) => {
    const result = await mutate({ variables: { input } });

    const workflowVersionStepChanges = result?.data?.deleteWorkflowVersionEdge;

    updateWorkflowVersionCache({
      workflowVersionStepChanges,
      workflowVersionId: input.workflowVersionId,
    });

    return result;
  };

  return { deleteWorkflowVersionEdge };
};
