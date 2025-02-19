import { useMutation } from '@apollo/client';

import { DELETE_ONE_RELATION_METADATA_ITEM } from '@/object-metadata/graphql/mutations';
import {
  DeleteOneRelationMetadataItemMutation,
  DeleteOneRelationMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';
import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useDeleteOneRelationMetadataItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    DeleteOneRelationMetadataItemMutation,
    DeleteOneRelationMetadataItemMutationVariables
  >(DELETE_ONE_RELATION_METADATA_ITEM, {
    client: apolloMetadataClient,
  });

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const deleteOneRelationMetadataItem = async (
    idToDelete: DeleteOneRelationMetadataItemMutationVariables['idToDelete'],
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
    deleteOneRelationMetadataItem,
  };
};
