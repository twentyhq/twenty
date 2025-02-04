import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { useMutation } from '@apollo/client';
import { BUILD_DRAFT_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/buildDraftServerlessFunction';
import {
  BuildDraftServerlessFunctionMutation,
  BuildDraftServerlessFunctionMutationVariables,
  BuildDraftServerlessFunctionInput,
} from '~/generated-metadata/graphql';

export const useBuildDraftServerlessFunction = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const [mutate] = useMutation<
    BuildDraftServerlessFunctionMutation,
    BuildDraftServerlessFunctionMutationVariables
  >(BUILD_DRAFT_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient,
  });

  const buildDraftServerlessFunction = async (
    input: BuildDraftServerlessFunctionInput,
  ) => {
    return await mutate({
      variables: {
        input,
      },
    });
  };
  return { buildDraftServerlessFunction };
};
