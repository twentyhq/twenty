import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import {
  DeleteOneMetadataObjectMutation,
  DeleteOneMetadataObjectMutationVariables,
} from '~/generated-metadata/graphql';

import { DELETE_ONE_METADATA_OBJECT } from '../graphql/mutations';
import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';

import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useDeleteOneMetadataObject = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    DeleteOneMetadataObjectMutation,
    DeleteOneMetadataObjectMutationVariables
  >(DELETE_ONE_METADATA_OBJECT, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const deleteOneMetadataObject = async (
    idToDelete: DeleteOneMetadataObjectMutationVariables['idToDelete'],
  ) => {
    return await mutate({
      variables: {
        idToDelete,
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_METADATA_OBJECTS) ?? ''],
    });
  };

  return {
    deleteOneMetadataObject,
  };
};
