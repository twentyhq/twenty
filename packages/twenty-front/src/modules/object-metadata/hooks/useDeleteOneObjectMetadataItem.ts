import { ApolloClient, useMutation } from '@apollo/client';

import {
  DeleteOneObjectMetadataItemMutation,
  DeleteOneObjectMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { DELETE_ONE_OBJECT_METADATA_ITEM } from '../graphql/mutations';

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
      optimisticResponse: {
        deleteOneObject: {
          id: idToDelete,
          __typename: 'object',
        } as any,
      },
    });
  };

  return {
    deleteOneObjectMetadataItem,
  };
};
