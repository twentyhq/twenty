import { useMutation } from '@apollo/client';

import {
  type CreateObjectInput,
  type CreateOneObjectMetadataItemMutation,
  type CreateOneObjectMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_OBJECT_METADATA_ITEM } from '../graphql/mutations';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { isDefined } from 'twenty-shared/utils';

export const useCreateOneObjectMetadataItem = () => {
  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');
  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

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

    if (isDefined(createdObjectMetadata.data?.createOneObject?.id)) {
      await refreshCoreViewsByObjectMetadataId(
        createdObjectMetadata.data.createOneObject.id,
      );
    }

    return createdObjectMetadata;
  };

  return {
    createOneObjectMetadataItem,
  };
};
