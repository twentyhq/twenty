import { useMutation } from '@apollo/client';

import {
  type CreateFieldInput,
  type CreateOneFieldMetadataItemMutation,
  type CreateOneFieldMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_FIELD_METADATA_ITEM } from '../graphql/mutations';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';

export const useCreateOneFieldMetadataItem = () => {
  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const [mutate] = useMutation<
    CreateOneFieldMetadataItemMutation,
    CreateOneFieldMetadataItemMutationVariables
  >(CREATE_ONE_FIELD_METADATA_ITEM);

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const createOneFieldMetadataItem = async (input: CreateFieldInput) => {
    const result = await mutate({
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
