import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import {
  CreateOneObjectMutation,
  CreateOneObjectMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_OBJECT } from '../graphql/mutations';
import { GET_ALL_OBJECTS } from '../graphql/queries';

import { useApolloMetadataClient } from './useApolloClientMetadata';

export const useCreateOneMetadataObject = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    CreateOneObjectMutation,
    CreateOneObjectMutationVariables
  >(CREATE_ONE_OBJECT, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const createOneMetadataObject = (
    input: CreateOneObjectMutationVariables['input']['object'],
  ) =>
    mutate({
      variables: {
        input: {
          object: {
            ...input,
          },
        },
      },
      refetchQueries: [getOperationName(GET_ALL_OBJECTS) ?? ''],
    });

  return {
    createOneMetadataObject,
  };
};
