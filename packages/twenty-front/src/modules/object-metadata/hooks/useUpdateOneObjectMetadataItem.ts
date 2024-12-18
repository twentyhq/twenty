import { useMutation } from '@apollo/client';

import {
  UpdateOneObjectInput,
  UpdateOneObjectMetadataItemMutation,
  UpdateOneObjectMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { UPDATE_ONE_OBJECT_METADATA_ITEM } from '../graphql/mutations';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';
import { useApolloMetadataClient } from './useApolloMetadataClient';

// TODO: Slice the Apollo store synchronously in the update function instead of subscribing, so we can use update after read in the same function call
export const useUpdateOneObjectMetadataItem = () => {
  const apolloClientMetadata = useApolloMetadataClient();

  const [mutate, { loading }] = useMutation<
    UpdateOneObjectMetadataItemMutation,
    UpdateOneObjectMetadataItemMutationVariables
  >(UPDATE_ONE_OBJECT_METADATA_ITEM, {
    client: apolloClientMetadata ?? undefined,
  });

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
