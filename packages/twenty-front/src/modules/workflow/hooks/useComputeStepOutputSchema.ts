import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { COMPUTE_STEP_OUTPUT_SCHEMA } from '@/workflow/graphql/mutations/computeStepOutputSchema';
import { useMutation } from '@apollo/client';
import {
  type ComputeStepOutputSchemaInput,
  type ComputeStepOutputSchemaMutation,
  type ComputeStepOutputSchemaMutationVariables,
} from '~/generated-metadata/graphql';

export const useComputeStepOutputSchema = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutate] = useMutation<
    ComputeStepOutputSchemaMutation,
    ComputeStepOutputSchemaMutationVariables
  >(COMPUTE_STEP_OUTPUT_SCHEMA, {
    client: apolloCoreClient,
  });

  const computeStepOutputSchema = async (
    input: ComputeStepOutputSchemaInput,
  ) => {
    return await mutate({ variables: { input } });
  };

  return { computeStepOutputSchema };
};
