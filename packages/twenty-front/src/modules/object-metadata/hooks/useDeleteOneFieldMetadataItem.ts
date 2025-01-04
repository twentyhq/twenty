import { useMutation } from '@apollo/client';

import {
  DeleteOneFieldMetadataItemMutation,
  DeleteOneFieldMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { DELETE_ONE_FIELD_METADATA_ITEM } from '../graphql/mutations';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';
import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useDeleteOneFieldMetadataItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    DeleteOneFieldMetadataItemMutation,
    DeleteOneFieldMetadataItemMutationVariables
  >(DELETE_ONE_FIELD_METADATA_ITEM, {
    client: apolloMetadataClient,
  });

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const deleteOneFieldMetadataItem = async (
    idToDelete: DeleteOneFieldMetadataItemMutationVariables['idToDelete'],
  ) => {
    const result = await mutate({
      variables: {
        idToDelete,
      },
    });

    await refreshObjectMetadataItems();

    return result;
  };

  return {
    deleteOneFieldMetadataItem,
  };
};
