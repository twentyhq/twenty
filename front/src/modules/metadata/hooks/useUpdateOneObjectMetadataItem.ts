import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import {
  UpdateOneObjectMetadataItemMutation,
  UpdateOneObjectMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { UPDATE_ONE_METADATA_OBJECT } from '../graphql/mutations';
import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';

import { useApolloMetadataClient } from './useApolloMetadataClient';

// TODO: Slice the Apollo store synchronously in the update function instead of subscribing, so we can use update after read in the same function call
export const useUpdateOneObjectMetadataItem = () => {
  const apolloClientMetadata = useApolloMetadataClient();

  const [mutate] = useMutation<
    UpdateOneObjectMetadataItemMutation,
    UpdateOneObjectMetadataItemMutationVariables
  >(UPDATE_ONE_METADATA_OBJECT, {
    client: apolloClientMetadata ?? undefined,
  });

  const updateOneObjectMetadataItem = async ({
    idToUpdate,
    updatePayload,
  }: {
    idToUpdate: UpdateOneObjectMetadataItemMutationVariables['idToUpdate'];
    updatePayload: Pick<
      UpdateOneObjectMetadataItemMutationVariables['updatePayload'],
      | 'description'
      | 'icon'
      | 'isActive'
      | 'labelPlural'
      | 'labelSingular'
      | 'namePlural'
      | 'nameSingular'
    >;
  }) => {
    return await mutate({
      variables: {
        idToUpdate,
        updatePayload,
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_METADATA_OBJECTS) ?? ''],
    });
  };

  return {
    updateOneObjectMetadataItem,
  };
};
