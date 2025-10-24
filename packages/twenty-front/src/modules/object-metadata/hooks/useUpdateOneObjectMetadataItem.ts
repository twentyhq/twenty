import {
  useUpdateOneObjectMetadataItemMutation,
  type UpdateOneObjectInput,
} from '~/generated-metadata/graphql';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';

// TODO: Slice the Apollo store synchronously in the update function instead of subscribing, so we can use update after read in the same function call
export const useUpdateOneObjectMetadataItem = () => {
  const [updateOneObjectMetadataItemMutation, { loading }] =
    useUpdateOneObjectMetadataItemMutation();

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const updateOneObjectMetadataItem = async ({
    idToUpdate,
    updatePayload,
  }: {
    idToUpdate: UpdateOneObjectInput['id'];
    updatePayload: UpdateOneObjectInput['update'];
  }) => {
    const result = await updateOneObjectMetadataItemMutation({
      variables: {
        idToUpdate,
        updatePayload,
      },
    });

    await refreshObjectMetadataItems();
    await refreshCoreViewsByObjectMetadataId(idToUpdate);

    return result;
  };

  return {
    updateOneObjectMetadataItem,
    loading,
  };
};
