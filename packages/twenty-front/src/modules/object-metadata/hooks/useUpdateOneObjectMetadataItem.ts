import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import { z } from 'zod';

import { updateObjectMetadataItemPayloadSchema } from '@/object-metadata/schemas/updateObjectMetadataItemPayloadSchema';
import {
  UpdateOneObjectMetadataItemMutation,
  UpdateOneObjectMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { UPDATE_ONE_OBJECT_METADATA_ITEM } from '../graphql/mutations';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '../graphql/queries';

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
    idToUpdate: UpdateOneObjectMetadataItemMutationVariables['idToUpdate'];
    updatePayload: z.input<typeof updateObjectMetadataItemPayloadSchema>;
  }) => {
    return await mutate({
      variables: {
        idToUpdate,
        updatePayload:
          updateObjectMetadataItemPayloadSchema.parse(updatePayload),
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_OBJECT_METADATA_ITEMS) ?? ''],
    });
  };

  return {
    updateOneObjectMetadataItem,
  };
};
