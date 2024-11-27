import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { COMPUTE_STEP_OUTPUT_SCHEMA } from '@/workflow/graphql/mutations/computeStepOutputSchema';
import { useMutation } from '@apollo/client';
import {
  ComputeStepOutputSchemaInput,
  ComputeStepOutputSchemaMutation,
  ComputeStepOutputSchemaMutationVariables,
} from '~/generated/graphql';

export const useComputeStepOutputSchema = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const [mutate] = useMutation<
    ComputeStepOutputSchemaMutation,
    ComputeStepOutputSchemaMutationVariables
  >(COMPUTE_STEP_OUTPUT_SCHEMA, {
    client: apolloMetadataClient,
  });

  const computeStepOutputSchema = async (
    input: ComputeStepOutputSchemaInput,
  ) => {
    return await mutate({ variables: { input } });
  };

  return { computeStepOutputSchema };
};
