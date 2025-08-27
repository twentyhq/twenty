import { useMutation } from '@apollo/client';

import { UPDATE_ONE_DATABASE_CONNECTION } from '@/databases/graphql/mutations/updateOneDatabaseConnection';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  type UpdateRemoteServerInput,
  type UpdateServerMutation,
  type UpdateServerMutationVariables,
} from '~/generated-metadata/graphql';

export const useUpdateOneDatabaseConnection = () => {
  const apolloMetadataClient = useApolloCoreClient();

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
