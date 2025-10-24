import { useDeleteOneObjectMetadataItemMutation } from '~/generated-metadata/graphql';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useRefreshAllCoreViews } from '@/views/hooks/useRefreshAllCoreViews';

export const useDeleteOneObjectMetadataItem = () => {
  const [deleteOneObjectMetadataItemMutation] =
    useDeleteOneObjectMetadataItemMutation();

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const { refreshAllCoreViews } = useRefreshAllCoreViews();

  const deleteOneObjectMetadataItem = async (idToDelete: string) => {
    const result = await deleteOneObjectMetadataItemMutation({
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
