import { useMutation } from '@apollo/client';

import {
  UpdateOneObjectInput,
  UpdateOneObjectMetadataItemMutation,
  UpdateOneObjectMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { UPDATE_ONE_OBJECT_METADATA_ITEM } from '../graphql/mutations';

import { useApolloMetadataClient } from './useApolloMetadataClient';

// TODO: Slice the Apollo store synchronously in the update function instead of subscribing, so we can use update after read in the same function call
export const useUpdateOneObjectMetadataItem = () => {
  const apolloClientMetadata = useApolloMetadataClient();

  const [mutate] = useMutation<
    UpdateOneObjectMetadataItemMutation,
    UpdateOneObjectMetadataItemMutationVariables
  >(UPDATE_ONE_OBJECT_METADATA_ITEM, {
    client: apolloClientMetadata ?? undefined,
  });

  const updateOneObjectMetadataItem = async ({
    idToUpdate,
    updatePayload,
  }: {
    idToUpdate: UpdateOneObjectInput['id'];
    updatePayload: UpdateOneObjectInput['update'];
  }) => {
    return await mutate({
      variables: {
        idToUpdate,
        updatePayload,
      },
      optimisticResponse: {
        updateOneObject: {
          id: idToUpdate,
          updatedAt: new Date().toISOString(),
          __typename: 'object',
          ...updatePayload,
        } as UpdateOneObjectMetadataItemMutation['updateOneObject'],
      },
    });
  };

  return {
    updateOneObjectMetadataItem,
  };
};
