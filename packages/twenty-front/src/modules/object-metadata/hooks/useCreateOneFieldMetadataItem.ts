import { useMutation } from '@apollo/client';

import {
  type CreateFieldInput,
  type CreateOneFieldMetadataItemMutation,
  type CreateOneFieldMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_FIELD_METADATA_ITEM } from '../graphql/mutations';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useRefreshCachedViews } from '@/views/hooks/useRefreshViews';

export const useCreateOneFieldMetadataItem = () => {
  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const [mutate] = useMutation<
    CreateOneFieldMetadataItemMutation,
    CreateOneFieldMetadataItemMutationVariables
  >(CREATE_ONE_FIELD_METADATA_ITEM);

  const { refreshCachedViews } = useRefreshCachedViews();

  const createOneFieldMetadataItem = async (input: CreateFieldInput) => {
    const result = await mutate({
      variables: {
        input: {
          field: input,
        },
      },
    });

    await refreshObjectMetadataItems();

    await refreshCachedViews();

    return result;
  };

  return {
    createOneFieldMetadataItem,
  };
};
