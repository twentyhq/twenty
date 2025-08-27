import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { DELETE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/deleteWorkflowVersionStep';
import { useUpdateWorkflowVersionCache } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionCache';
import { useMutation } from '@apollo/client';
import {
  type DeleteWorkflowVersionStepInput,
  type DeleteWorkflowVersionStepMutation,
  type DeleteWorkflowVersionStepMutationVariables,
} from '~/generated-metadata/graphql';

export const useDeleteWorkflowVersionStep = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { updateWorkflowVersionCache } = useUpdateWorkflowVersionCache();

  const [mutate] = useMutation<
    DeleteWorkflowVersionStepMutation,
    DeleteWorkflowVersionStepMutationVariables
  >(DELETE_WORKFLOW_VERSION_STEP, {
    client: apolloCoreClient,
  });

  const deleteWorkflowVersionStep = async (
    input: DeleteWorkflowVersionStepInput,
  ) => {
    const result = await mutate({ variables: { input } });

    const workflowVersionStepChanges = result?.data?.deleteWorkflowVersionStep;

    updateWorkflowVersionCache({
      workflowVersionStepChanges,
      workflowVersionId: input.workflowVersionId,
    });

    return workflowVersionStepChanges;
  };

  return { deleteWorkflowVersionStep };
};
