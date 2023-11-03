import { useMemo } from 'react';
import { useQuery } from '@apollo/client';

import {
  ObjectMetadataItemsQuery,
  ObjectMetadataItemsQueryVariables,
} from '~/generated-metadata/graphql';

import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';
import { formatPagedObjectMetadataItemsToObjectMetadataItems } from '../utils/formatPagedObjectMetadataItemsToObjectMetadataItems';

import { useApolloMetadataClient } from './useApolloMetadataClient';

// TODO: test fetchMore
export const useFindAllMetadata = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const { data, fetchMore: fetchMoreInternal } = useQuery<
    ObjectMetadataItemsQuery,
    ObjectMetadataItemsQueryVariables
  >(FIND_MANY_METADATA_OBJECTS, {
    client: apolloMetadataClient ?? ({} as any),
    skip: !apolloMetadataClient,
  });

  const hasMore = data?.objects?.pageInfo?.hasNextPage;

  const fetchMore = () =>
    fetchMoreInternal({
      variables: {
        afterCursor: data?.objects?.pageInfo?.endCursor,
      },
    });

  const objectMetadataItems = useMemo(() => {
    return formatPagedObjectMetadataItemsToObjectMetadataItems({
      pagedObjectMetadataItems: data,
    });
  }, [data]);

  return {
    objectMetadataItems,
    hasMore,
    fetchMore,
  };
};
