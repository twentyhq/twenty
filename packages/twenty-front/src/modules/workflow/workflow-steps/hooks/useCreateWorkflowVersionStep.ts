import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CREATE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/createWorkflowVersionStep';
import { useMutation } from '@apollo/client';
import {
  CreateWorkflowVersionStepInput,
  CreateWorkflowVersionStepMutation,
  CreateWorkflowVersionStepMutationVariables,
} from '~/generated-metadata/graphql';
import { useWorkflowVersionStepUpdateCache } from '@/workflow/workflow-steps/hooks/useWorkflowVersionStepUpdateCache';

export const useCreateWorkflowVersionStep = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { updateCache } = useWorkflowVersionStepUpdateCache();

  const [mutate] = useMutation<
    CreateWorkflowVersionStepMutation,
    CreateWorkflowVersionStepMutationVariables
  >(CREATE_WORKFLOW_VERSION_STEP, {
    client: apolloCoreClient,
  });

  const createWorkflowVersionStep = async (
    input: CreateWorkflowVersionStepInput,
  ) => {
    const result = await mutate({
      variables: { input },
    });

    const workflowVersionStepChanges = result?.data?.createWorkflowVersionStep;

    updateCache({
      workflowVersionStepChanges,
      workflowVersionId: input.workflowVersionId,
    });

    return result;
  };

  return { createWorkflowVersionStep };
};
