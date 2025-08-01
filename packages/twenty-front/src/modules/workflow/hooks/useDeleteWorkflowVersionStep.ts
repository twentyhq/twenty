import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { DELETE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/deleteWorkflowVersionStep';
import { useMutation } from '@apollo/client';
import {
  DeleteWorkflowVersionStepInput,
  DeleteWorkflowVersionStepMutation,
  DeleteWorkflowVersionStepMutationVariables,
} from '~/generated-metadata/graphql';
import { useWorkflowVersionStepUpdateCache } from '@/workflow/workflow-steps/hooks/useWorkflowVersionStepUpdateCache';

export const useDeleteWorkflowVersionStep = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { updateCache } = useWorkflowVersionStepUpdateCache();

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

    const workflowVersionStepUpdates = result?.data?.deleteWorkflowVersionStep;

    updateCache({
      workflowVersionStepUpdates,
      workflowVersionId: input.workflowVersionId,
    });
  };

  return { deleteWorkflowVersionStep };
};
