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

  const createOneMetadataObject = (
    input: CreateOneMetadataObjectMutationVariables['input']['object'],
  ) =>
    mutate({
      variables: {
        input: {
          object: {
            ...input,
          },
        },
      },
      refetchQueries: [getOperationName(FIND_MANY_METADATA_OBJECTS) ?? ''],
    });

  return {
    createOneMetadataObject,
  };
};
