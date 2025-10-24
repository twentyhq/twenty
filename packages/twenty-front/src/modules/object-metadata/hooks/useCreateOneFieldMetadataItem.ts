import {
  type CreateFieldInput,
  useCreateOneFieldMetadataItemMutation,
} from '~/generated-metadata/graphql';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';

export const useCreateOneFieldMetadataItem = () => {
  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const [createOneFieldMetadataItemMutation] =
    useCreateOneFieldMetadataItemMutation();

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const createOneFieldMetadataItem = async (input: CreateFieldInput) => {
    const result = await createOneFieldMetadataItemMutation({
      variables: {
        input: {
          field: input,
        },
      },
    });

    await refreshObjectMetadataItems();

    await refreshCoreViewsByObjectMetadataId(input.objectMetadataId);
    return result;
  };

  return {
    createOneFieldMetadataItem,
  };
};
