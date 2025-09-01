import { useMutation } from '@apollo/client';

import {
  type CreateObjectInput,
  type CreateOneObjectMetadataItemMutation,
  type CreateOneObjectMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_OBJECT_METADATA_ITEM } from '../graphql/mutations';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useRefreshCachedViews } from '@/views/hooks/useRefreshViews';

export const useCreateOneObjectMetadataItem = () => {
  const { refreshCachedViews } = useRefreshCachedViews();
  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const [mutate] = useMutation<
    CreateOneObjectMetadataItemMutation,
    CreateOneObjectMetadataItemMutationVariables
  >(CREATE_ONE_OBJECT_METADATA_ITEM);

  const createOneObjectMetadataItem = async (input: CreateObjectInput) => {
    const createdObjectMetadata = await mutate({
      variables: {
        input: { object: input },
      },
    });

    await refreshObjectMetadataItems();
    await refreshCachedViews();
    return createdObjectMetadata;
  };

  return {
    createOneObjectMetadataItem,
  };
};
