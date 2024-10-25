import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { ApolloClient, useMutation } from '@apollo/client';
import {
  ComputeStepSettingOutputSchemaInput,
  ComputeStepSettingOutputSchemaMutation,
  ComputeStepSettingOutputSchemaMutationVariables,
} from '~/generated/graphql';
import { COMPUTE_STEP_SETTING_OUTPUT_SCHEMA } from '@/workflow/graphql/mutations/computeStepSettingOutputSchema';

export const useComputeStepSettingOutputSchema = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const [mutate] = useMutation<
    ComputeStepSettingOutputSchemaMutation,
    ComputeStepSettingOutputSchemaMutationVariables
  >(COMPUTE_STEP_SETTING_OUTPUT_SCHEMA, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const computeStepSettingOutputSchema = async (
    input: ComputeStepSettingOutputSchemaInput,
  ) => {
    return await mutate({ variables: { input } });
  };

  return { computeStepSettingOutputSchema };
};
