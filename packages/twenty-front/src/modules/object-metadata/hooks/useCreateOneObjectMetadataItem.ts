import {
  type CreateObjectInput,
  useCreateOneObjectMetadataItemMutation,
} from '~/generated-metadata/graphql';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { isDefined } from 'twenty-shared/utils';

export const useCreateOneObjectMetadataItem = () => {
  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');
  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const [createOneObjectMetadataItemMutation] =
    useCreateOneObjectMetadataItemMutation();

  const createOneObjectMetadataItem = async (input: CreateObjectInput) => {
    const createdObjectMetadata = await createOneObjectMetadataItemMutation({
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
