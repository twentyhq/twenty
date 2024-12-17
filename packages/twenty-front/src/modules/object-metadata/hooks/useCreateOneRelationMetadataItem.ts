import { useMutation } from '@apollo/client';

import {
  CreateOneRelationMetadataMutation,
  CreateOneRelationMetadataMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_RELATION_METADATA_ITEM } from '../graphql/mutations';
import {
  formatRelationMetadataInput,
  FormatRelationMetadataInputParams,
} from '../utils/formatRelationMetadataInput';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';
import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useCreateOneRelationMetadataItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    CreateOneRelationMetadataMutation,
    CreateOneRelationMetadataMutationVariables
  >(CREATE_ONE_RELATION_METADATA_ITEM, {
    client: apolloMetadataClient,
  });

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const createOneRelationMetadataItem = async (
    input: FormatRelationMetadataInputParams,
  ) => {
    const result = await mutate({
      variables: { input: { relation: formatRelationMetadataInput(input) } },
    });

    await refreshObjectMetadataItems();

    return result;
  };

  return {
    createOneRelationMetadataItem,
  };
};
