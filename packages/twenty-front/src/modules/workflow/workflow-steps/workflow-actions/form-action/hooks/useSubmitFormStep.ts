import { SUBMIT_FORM_STEP } from '@/workflow/workflow-steps/workflow-actions/form-action/graphql/mutations/submitFormStep';
import { useApolloClient, useMutation } from '@apollo/client';
import {
  SubmitFormStepInput,
  SubmitFormStepMutation,
  SubmitFormStepMutationVariables,
} from '~/generated/graphql';

export const useSubmitFormStep = () => {
  const apolloClient = useApolloClient();
  const [mutate] = useMutation<
    SubmitFormStepMutation,
    SubmitFormStepMutationVariables
  >(SUBMIT_FORM_STEP, {
    client: apolloClient,
  });

  const submitFormStep = async (input: SubmitFormStepInput) => {
    const result = await mutate({
      variables: { input },
    });
    const isSuccess = result?.data?.submitFormStep;

    return isSuccess;
  };

  return { submitFormStep };
};
