import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import {
  CreateOneMetadataFieldMutation,
  CreateOneMetadataFieldMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_METADATA_FIELD } from '../graphql/mutations';
import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';

import { useApolloClientMetadata } from './useApolloClientMetadata';

export const useCreateOneMetadataField = () => {
  const apolloClientMetadata = useApolloClientMetadata();

  const [mutate] = useMutation<
    CreateOneMetadataFieldMutation,
    CreateOneMetadataFieldMutationVariables
  >(CREATE_ONE_METADATA_FIELD, {
    client: apolloClientMetadata ?? ({} as ApolloClient<any>),
  });

  const createOneMetadataField = (
    input: CreateOneMetadataFieldMutationVariables['input']['field'],
  ) =>
    mutate({
      variables: {
        input: {
          field: {
            ...input,
          },
        },
      },
      refetchQueries: [getOperationName(FIND_MANY_METADATA_OBJECTS) ?? ''],
    });

  return {
    createOneMetadataField,
  };
};
