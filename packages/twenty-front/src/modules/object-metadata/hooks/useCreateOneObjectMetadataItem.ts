import { useMutation } from '@apollo/client';

import {
  CreateObjectInput,
  CreateOneObjectMetadataItemMutation,
  CreateOneObjectMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_OBJECT_METADATA_ITEM } from '../graphql/mutations';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';
import { useRefreshCachedViews } from '@/views/hooks/useRefreshViews';
import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useCreateOneObjectMetadataItem = () => {
  const { refreshCachedViews } = useRefreshCachedViews();

  const apolloMetadataClient = useApolloMetadataClient();
  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const [mutate] = useMutation<
    CreateOneObjectMetadataItemMutation,
    CreateOneObjectMetadataItemMutationVariables
  >(CREATE_ONE_OBJECT_METADATA_ITEM, {
    client: apolloMetadataClient,
  });

  const createOneObjectMetadataItem = async (input: CreateObjectInput) => {
    const createdObjectMetadata = await mutate({
      variables: {
        input: { object: input },
      },
    });

    await refreshObjectMetadataItems();
    refreshCachedViews();
    return createdObjectMetadata;
  };

  return {
    createOneObjectMetadataItem,
  };
};
