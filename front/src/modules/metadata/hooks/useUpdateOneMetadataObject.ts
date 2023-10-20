import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import {
  UpdateOneMetadataObjectMutation,
  UpdateOneMetadataObjectMutationVariables,
} from '~/generated-metadata/graphql';

import { UPDATE_ONE_METADATA_OBJECT } from '../graphql/mutations';
import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';

import { useApolloMetadataClient } from './useApolloMetadataClient';

// TODO: Slice the Apollo store synchronously in the update function instead of subscribing, so we can use update after read in the same function call
export const useUpdateOneMetadataObject = () => {
  const apolloClientMetadata = useApolloMetadataClient();

  const [mutate] = useMutation<
    UpdateOneMetadataObjectMutation,
    UpdateOneMetadataObjectMutationVariables
  >(UPDATE_ONE_METADATA_OBJECT, {
    client: apolloClientMetadata ?? undefined,
  });

  const updateOneMetadataObject = async ({
    idToUpdate,
    updatePayload,
  }: {
    idToUpdate: UpdateOneMetadataObjectMutationVariables['idToUpdate'];
    updatePayload: Pick<
      UpdateOneMetadataObjectMutationVariables['updatePayload'],
      'description' | 'icon' | 'isActive' | 'labelPlural' | 'labelSingular'
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
    updateOneMetadataObject,
  };
};
