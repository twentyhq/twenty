import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import {
  CreateOneMetadataObjectMutation,
  CreateOneMetadataObjectMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_METADATA_OBJECT } from '../graphql/mutations';
import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';

import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useCreateOneMetadataObject = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    CreateOneMetadataObjectMutation,
    CreateOneMetadataObjectMutationVariables
  >(CREATE_ONE_METADATA_OBJECT, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const createOneMetadataObject = async (
    input: CreateOneMetadataObjectMutationVariables['input']['object'],
  ) => {
    return await mutate({
      variables: {
        input: {
          object: {
            ...input,
          },
        },
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_METADATA_OBJECTS) ?? ''],
    });
  };

  return {
    createOneMetadataObject,
  };
};
