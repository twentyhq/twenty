import { ApolloClient, useMutation } from '@apollo/client';

import {
  DeleteOneFieldMetadataItemMutation,
  DeleteOneFieldMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { DELETE_ONE_FIELD_METADATA_ITEM } from '../graphql/mutations';

import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useDeleteOneFieldMetadataItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    DeleteOneFieldMetadataItemMutation,
    DeleteOneFieldMetadataItemMutationVariables
  >(DELETE_ONE_FIELD_METADATA_ITEM, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const deleteOneFieldMetadataItem = async (
    idToDelete: DeleteOneFieldMetadataItemMutationVariables['idToDelete'],
  ) => {
    return await mutate({
      variables: {
        idToDelete,
      },
      awaitRefetchQueries: true,
      optimisticResponse: {
        deleteOneField: {
          id: idToDelete,
          __typename: 'field',
          name: '',
        } as DeleteOneFieldMetadataItemMutation['deleteOneField'],
      },
    });
  };

  return {
    deleteOneFieldMetadataItem,
  };
};
