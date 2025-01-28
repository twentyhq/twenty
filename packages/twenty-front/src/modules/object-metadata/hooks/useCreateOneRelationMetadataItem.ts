import { useMutation } from '@apollo/client';

import {
  CreateOneRelationMetadataItemMutation,
  CreateOneRelationMetadataItemMutationVariables,
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
    CreateOneRelationMetadataItemMutation,
    CreateOneRelationMetadataItemMutationVariables
  >(CREATE_ONE_RELATION_METADATA_ITEM, {
    client: apolloMetadataClient,
  });

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const createOneRelationMetadataItem = async (
    input: FormatRelationMetadataInputParams,
  ) => {
    const result = await mutate({
      variables: {
        input: { relationMetadata: formatRelationMetadataInput(input) },
      },
    });

    await refreshObjectMetadataItems();

    return result;
  };

  return {
    createOneRelationMetadataItem,
  };
};
