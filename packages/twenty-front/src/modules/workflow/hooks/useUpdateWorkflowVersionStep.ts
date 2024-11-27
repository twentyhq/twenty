import { useApolloClient, useMutation } from '@apollo/client';
import {
  UpdateWorkflowVersionStepInput,
  UpdateWorkflowVersionStepMutation,
  UpdateWorkflowVersionStepMutationVariables,
} from '~/generated/graphql';
import { UPDATE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/updateWorkflowVersionStep';

export const useUpdateWorkflowVersionStep = () => {
  const apolloClient = useApolloClient();
  const [mutate] = useMutation<
    UpdateWorkflowVersionStepMutation,
    UpdateWorkflowVersionStepMutationVariables
  >(UPDATE_WORKFLOW_VERSION_STEP, {
    client: apolloClient,
  });

  const updateWorkflowVersionStep = async (
    input: UpdateWorkflowVersionStepInput,
  ) => {
    const result = await mutate({ variables: { input } });
    return result;
  };

  return { updateWorkflowVersionStep };
};
