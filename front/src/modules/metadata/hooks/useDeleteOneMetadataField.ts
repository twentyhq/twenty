import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import {
  DeleteOneMetadataFieldMutation,
  DeleteOneMetadataFieldMutationVariables,
} from '~/generated-metadata/graphql';

import { DELETE_ONE_METADATA_FIELD } from '../graphql/mutations';
import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';

import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useDeleteOneMetadataField = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    DeleteOneMetadataFieldMutation,
    DeleteOneMetadataFieldMutationVariables
  >(DELETE_ONE_METADATA_FIELD, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const deleteOneMetadataField = async (
    idToDelete: DeleteOneMetadataFieldMutationVariables['idToDelete'],
  ) => {
    return await mutate({
      variables: {
        idToDelete,
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_METADATA_OBJECTS) ?? ''],
    });
  };

  return {
    deleteOneMetadataField,
  };
};
