import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { ApolloClient, useMutation } from '@apollo/client';
import { EXECUTE_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/executeOneServerlessFunction';

export const useExecuteServerlessFunction = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const [mutate] = useMutation(EXECUTE_ONE_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const executeOneServerlessFunction = async (
    id: string,
    payload: object = {},
  ) => {
    return await mutate({
      variables: {
        id,
        payload,
      },
    });
  };
  return { executeOneServerlessFunction };
};
