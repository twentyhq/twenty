import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import {
  CreateOneFieldMutation,
  CreateOneFieldMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_FIELD } from '../graphql/mutations';
import { GET_ALL_OBJECTS } from '../graphql/queries';

import { useApolloMetadataClient } from './useApolloClientMetadata';

export const useCreateOneMetadataField = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    CreateOneFieldMutation,
    CreateOneFieldMutationVariables
  >(CREATE_ONE_FIELD, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const createOneMetadataField = (
    input: CreateOneFieldMutationVariables['input']['field'],
  ) =>
    mutate({
      variables: {
        input: {
          field: {
            ...input,
          },
        },
      },
      refetchQueries: [getOperationName(GET_ALL_OBJECTS) ?? ''],
    });

  return {
    createOneMetadataField,
  };
};
