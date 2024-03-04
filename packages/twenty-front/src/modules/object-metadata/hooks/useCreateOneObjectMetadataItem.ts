import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import {
  CreateObjectInput,
  CreateOneObjectMetadataItemMutation,
  CreateOneObjectMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_OBJECT_METADATA_ITEM } from '../graphql/mutations';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '../graphql/queries';

import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useCreateOneObjectMetadataItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    CreateOneObjectMetadataItemMutation,
    CreateOneObjectMetadataItemMutationVariables
  >(CREATE_ONE_OBJECT_METADATA_ITEM, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const createOneObjectMetadataItem = async (input: CreateObjectInput) => {
    return await mutate({
      variables: {
        input: { object: input },
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_OBJECT_METADATA_ITEMS) ?? ''],
    });
  };

  return {
    createOneObjectMetadataItem,
  };
};
