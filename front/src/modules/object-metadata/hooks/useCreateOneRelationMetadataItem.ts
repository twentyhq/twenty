import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import {
  CreateOneRelationMetadataMutation,
  CreateOneRelationMetadataMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_RELATION_METADATA_ITEM } from '../graphql/mutations';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '../graphql/queries';
import {
  formatRelationMetadataInput,
  FormatRelationMetadataInputParams,
} from '../utils/formatRelationMetadataInput';

import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useCreateOneRelationMetadataItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    CreateOneRelationMetadataMutation,
    CreateOneRelationMetadataMutationVariables
  >(CREATE_ONE_RELATION_METADATA_ITEM, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const createOneRelationMetadataItem = async (
    input: FormatRelationMetadataInputParams,
  ) => {
    return await mutate({
      variables: { input: { relation: formatRelationMetadataInput(input) } },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_OBJECT_METADATA_ITEMS) ?? ''],
    });
  };

  return {
    createOneRelationMetadataItem,
  };
};
