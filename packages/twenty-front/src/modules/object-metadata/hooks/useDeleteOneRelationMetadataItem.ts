import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { DELETE_ONE_RELATION_METADATA_ITEM } from '@/object-metadata/graphql/mutations';
import {
  DeleteOneRelationMetadataItemMutation,
  DeleteOneRelationMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { FIND_MANY_OBJECT_METADATA_ITEMS } from '../graphql/queries';

import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useDeleteOneRelationMetadataItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    DeleteOneRelationMetadataItemMutation,
    DeleteOneRelationMetadataItemMutationVariables
  >(DELETE_ONE_RELATION_METADATA_ITEM, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const deleteOneRelationMetadataItem = async (
    idToDelete: DeleteOneRelationMetadataItemMutationVariables['idToDelete'],
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
    deleteOneRelationMetadataItem,
  };
};
