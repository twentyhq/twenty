import { useMutation } from '@apollo/client';

import {
  type UpdateOneObjectInput,
  type UpdateOneObjectMetadataItemMutation,
  type UpdateOneObjectMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { UPDATE_ONE_OBJECT_METADATA_ITEM } from '../graphql/mutations';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';

// TODO: Slice the Apollo store synchronously in the update function instead of subscribing, so we can use update after read in the same function call
export const useUpdateOneObjectMetadataItem = () => {
  const [mutate, { loading }] = useMutation<
    UpdateOneObjectMetadataItemMutation,
    UpdateOneObjectMetadataItemMutationVariables
  >(UPDATE_ONE_OBJECT_METADATA_ITEM);

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const updateOneObjectMetadataItem = async ({
    idToUpdate,
    updatePayload,
  }: {
    idToUpdate: UpdateOneObjectInput['id'];
    updatePayload: UpdateOneObjectInput['update'];
  }) => {
    const result = await mutate({
      variables: {
        idToUpdate,
        updatePayload,
      },
    });

    await refreshObjectMetadataItems();

    return result;
  };

  return {
    updateOneObjectMetadataItem,
    loading,
  };
};
