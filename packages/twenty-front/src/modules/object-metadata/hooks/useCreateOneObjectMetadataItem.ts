import { useApolloClient, useMutation } from '@apollo/client';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import {
  CreateObjectInput,
  CreateOneObjectMetadataItemMutation,
  CreateOneObjectMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_OBJECT_METADATA_ITEM } from '../graphql/mutations';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';
import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useCreateOneObjectMetadataItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const apolloClient = useApolloClient();
  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const [mutate] = useMutation<
    CreateOneObjectMetadataItemMutation,
    CreateOneObjectMetadataItemMutationVariables
  >(CREATE_ONE_OBJECT_METADATA_ITEM, {
    client: apolloMetadataClient,
  });

  const createOneObjectMetadataItem = async (input: CreateObjectInput) => {
    const createdObjectMetadata = await mutate({
      variables: {
        input: { object: input },
      },
    });

    await refreshObjectMetadataItems();

    return createdObjectMetadata;
  };

  const findManyRecordsCache = async () => {
    await apolloClient.query({
      query: findManyRecordsQuery,
      fetchPolicy: 'network-only',
    });
  };

  return {
    createOneObjectMetadataItem,
    findManyRecordsCache,
  };
};
