import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import {
  UpdateOneMetadataFieldMutation,
  UpdateOneMetadataFieldMutationVariables,
} from '~/generated-metadata/graphql';

import { UPDATE_ONE_METADATA_FIELD } from '../graphql/mutations';
import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';

import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useUpdateOneMetadataField = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    UpdateOneMetadataFieldMutation,
    UpdateOneMetadataFieldMutationVariables
  >(UPDATE_ONE_METADATA_FIELD, {
    client: apolloMetadataClient ?? undefined,
  });

  const updateOneMetadataField = async ({
    fieldIdToUpdate,
    updatePayload,
  }: {
    fieldIdToUpdate: UpdateOneMetadataFieldMutationVariables['idToUpdate'];
    updatePayload: Pick<
      UpdateOneMetadataFieldMutationVariables['updatePayload'],
      'description' | 'icon' | 'isActive' | 'label'
    >;
  }) => {
    return await mutate({
      variables: {
        idToUpdate: fieldIdToUpdate,
        updatePayload: {
          label: updatePayload.label ?? undefined,
        },
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_METADATA_OBJECTS) ?? ''],
    });
  };

  return {
    updateOneMetadataField,
  };
};
