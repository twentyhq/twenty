import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import {
  DeleteOneObjectMetadataItemMutation,
  DeleteOneObjectMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { DELETE_ONE_OBJECT_METADATA_ITEM } from '../graphql/mutations';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '../graphql/queries';

import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useDeleteOneObjectMetadataItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    DeleteOneObjectMetadataItemMutation,
    DeleteOneObjectMetadataItemMutationVariables
  >(DELETE_ONE_OBJECT_METADATA_ITEM, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const deleteOneObjectMetadataItem = async (
    idToDelete: DeleteOneObjectMetadataItemMutationVariables['idToDelete'],
  ) => {
    return await mutate({
      variables: {
        idToDelete,
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_OBJECT_METADATA_ITEMS) ?? ''],
    });
  };

  return {
    deleteOneObjectMetadataItem,
  };
};
