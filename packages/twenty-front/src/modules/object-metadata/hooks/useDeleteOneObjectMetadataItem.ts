import { useMutation } from '@apollo/client';

import {
  type DeleteOneObjectMetadataItemMutation,
  type DeleteOneObjectMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { DELETE_ONE_OBJECT_METADATA_ITEM } from '../graphql/mutations';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useRefreshAllCoreViews } from '@/views/hooks/useRefreshAllCoreViews';

export const useDeleteOneObjectMetadataItem = () => {
  const [mutate] = useMutation<
    DeleteOneObjectMetadataItemMutation,
    DeleteOneObjectMetadataItemMutationVariables
  >(DELETE_ONE_OBJECT_METADATA_ITEM);

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const { refreshAllCoreViews } = useRefreshAllCoreViews();

  const deleteOneObjectMetadataItem = async (
    idToDelete: DeleteOneObjectMetadataItemMutationVariables['idToDelete'],
  ) => {
    const result = await mutate({
      variables: {
        idToDelete,
      },
    });

    await refreshObjectMetadataItems();
    await refreshAllCoreViews();

    return result;
  };

  return {
    deleteOneObjectMetadataItem,
  };
};
