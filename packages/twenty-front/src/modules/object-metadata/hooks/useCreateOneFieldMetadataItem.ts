import { useMutation } from '@apollo/client';

import {
  CreateFieldInput,
  CreateOneFieldMetadataItemMutation,
  CreateOneFieldMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_FIELD_METADATA_ITEM } from '../graphql/mutations';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';

export const useCreateOneFieldMetadataItem = () => {
  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const [mutate] = useMutation<
    CreateOneFieldMetadataItemMutation,
    CreateOneFieldMetadataItemMutationVariables
  >(CREATE_ONE_FIELD_METADATA_ITEM);

  const createOneFieldMetadataItem = async (input: CreateFieldInput) => {
    const result = await mutate({
      variables: {
        input: {
          field: input,
        },
      },
    });

    await refreshObjectMetadataItems();

    return result;
  };

  return {
    createOneFieldMetadataItem,
  };
};
