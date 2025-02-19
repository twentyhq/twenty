import { COMPUTE_STEP_OUTPUT_SCHEMA } from '@/workflow/graphql/mutations/computeStepOutputSchema';
import { useApolloClient, useMutation } from '@apollo/client';
import {
  ComputeStepOutputSchemaInput,
  ComputeStepOutputSchemaMutation,
  ComputeStepOutputSchemaMutationVariables,
} from '~/generated/graphql';

export const useComputeStepOutputSchema = () => {
  const apolloClient = useApolloClient();
  const [mutate] = useMutation<
    ComputeStepOutputSchemaMutation,
    ComputeStepOutputSchemaMutationVariables
  >(COMPUTE_STEP_OUTPUT_SCHEMA, {
    client: apolloClient,
  });

  const computeStepOutputSchema = async (
    input: ComputeStepOutputSchemaInput,
  ) => {
    return await mutate({ variables: { input } });
  };

  return { computeStepOutputSchema };
};
