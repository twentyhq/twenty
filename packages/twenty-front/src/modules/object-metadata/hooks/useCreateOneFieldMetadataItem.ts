import { ApolloClient, useMutation } from '@apollo/client';

import {
  CreateFieldInput,
  CreateOneFieldMetadataItemMutation,
  CreateOneFieldMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_FIELD_METADATA_ITEM } from '../graphql/mutations';

import { v4 } from 'uuid';
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
      optimisticResponse: {
        createOneField: {
          ...input,
          createdAt: new Date().toISOString(),
          __typename: 'field',
          id: v4(),
          updatedAt: undefined,
        },
      },
    });
  };

  return {
    createOneFieldMetadataItem,
  };
};
