import { useMutation } from '@apollo/client';

import { UPDATE_ONE_DATABASE_CONNECTION } from '@/databases/graphql/mutations/updateOneDatabaseConnection';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import {
  UpdateRemoteServerInput,
  UpdateServerMutation,
  UpdateServerMutationVariables,
} from '~/generated-metadata/graphql';

export const useUpdateOneDatabaseConnection = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    UpdateServerMutation,
    UpdateServerMutationVariables
  >(UPDATE_ONE_DATABASE_CONNECTION, {
    client: apolloMetadataClient,
  });

  const updateOneDatabaseConnection = async (
    input: UpdateRemoteServerInput,
  ) => {
    return await mutate({
      variables: {
        input,
      },
    });
  };

  return {
    updateOneDatabaseConnection,
  };
};
