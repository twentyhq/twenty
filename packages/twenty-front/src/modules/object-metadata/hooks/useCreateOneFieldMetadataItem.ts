import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import {
  CreateFieldInput,
  CreateOneFieldMetadataItemMutation,
  CreateOneFieldMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_FIELD_METADATA_ITEM } from '../graphql/mutations';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '../graphql/queries';

import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useCreateOneFieldMetadataItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    CreateOneFieldMetadataItemMutation,
    CreateOneFieldMetadataItemMutationVariables
  >(CREATE_ONE_FIELD_METADATA_ITEM, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const createOneFieldMetadataItem = async (input: CreateFieldInput) => {
    return await mutate({
      variables: {
        input: {
          field: input,
        },
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_OBJECT_METADATA_ITEMS) ?? ''],
    });
  };

  return {
    createOneFieldMetadataItem,
  };
};
