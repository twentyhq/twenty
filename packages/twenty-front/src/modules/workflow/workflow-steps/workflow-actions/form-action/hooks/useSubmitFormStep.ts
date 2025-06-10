import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
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

  const { findOneRecordQuery: findOneWorkflowRunQuery } = useFindOneRecordQuery(
    {
      objectNameSingular: CoreObjectNameSingular.WorkflowRun,
      recordGqlFields: {
        id: true,
        name: true,
        status: true,
        output: true,
        context: true,
        startedAt: true,
        endedAt: true,
      },
    },
  );

  const submitFormStep = async (input: SubmitFormStepInput) => {
    const result = await mutate({
      variables: { input },
      awaitRefetchQueries: true,
      refetchQueries: [
        {
          query: findOneWorkflowRunQuery,
          variables: {
            objectRecordId: input.workflowRunId,
          },
        },
      ],
    });
    const isSuccess = result?.data?.submitFormStep;

    return isSuccess;
  };

  return { submitFormStep };
};
