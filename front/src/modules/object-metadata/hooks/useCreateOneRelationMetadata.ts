import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import {
  CreateOneRelationMetadataMutation,
  CreateOneRelationMetadataMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_RELATION_METADATA } from '../graphql/mutations';
import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';
import {
  formatRelationMetadataInput,
  FormatRelationMetadataInputParams,
} from '../utils/formatRelationMetadataInput';

import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useCreateOneRelationMetadata = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    CreateOneRelationMetadataMutation,
    CreateOneRelationMetadataMutationVariables
  >(CREATE_ONE_RELATION_METADATA, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const createOneRelationMetadata = async (
    input: FormatRelationMetadataInputParams,
  ) => {
    return await mutate({
      variables: { input: { relation: formatRelationMetadataInput(input) } },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_METADATA_OBJECTS) ?? ''],
    });
  };

  return {
    createOneRelationMetadata,
  };
};
