import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client/react';
import {
  type CreateWorkflowVersionEdgeMutation,
  type CreateWorkflowVersionEdgeMutationVariables,
  type CreateWorkflowVersionEdgeInput,
} from '~/generated/graphql';
import { CREATE_WORKFLOW_VERSION_EDGE } from '@/workflow/graphql/mutations/createWorkflowVersionEdge';
import { useUpdateWorkflowVersionCache } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionCache';

export const useCreateWorkflowVersionEdge = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { updateWorkflowVersionCache } = useUpdateWorkflowVersionCache();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [mutate] = useMutation<
    CreateWorkflowVersionEdgeMutation,
    CreateWorkflowVersionEdgeMutationVariables
  >(CREATE_WORKFLOW_VERSION_EDGE, { client: apolloCoreClient });

  const createWorkflowVersionEdge = async (
    input: CreateWorkflowVersionEdgeInput,
  ) => {
    const result = await mutate({
      variables: { input },
      onError: (error) => {
        enqueueErrorSnackBar({ apolloError: error });
      },
    });

    const workflowVersionStepChanges = result?.data?.createWorkflowVersionEdge;

    updateWorkflowVersionCache({
      workflowVersionStepChanges,
      workflowVersionId: input.workflowVersionId,
    });

    return result;
  };

  return { createWorkflowVersionEdge };
};
