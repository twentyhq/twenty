import { useMemo } from 'react';
import { useQuery } from '@apollo/client';

import {
  MetadataObjectsQuery,
  MetadataObjectsQueryVariables,
} from '~/generated-metadata/graphql';

import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';
import { formatPagedMetadataObjectsToMetadataObjects } from '../utils/formatPagedMetadataObjectsToMetadataObjects';

import { useApolloMetadataClient } from './useApolloMetadataClient';

// TODO: test fetchMore
export const useFindManyMetadataObjects = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const { data, fetchMore: fetchMoreInternal } = useQuery<
    MetadataObjectsQuery,
    MetadataObjectsQueryVariables
  >(FIND_MANY_METADATA_OBJECTS, {
    client: apolloMetadataClient ?? undefined,
    skip: !apolloMetadataClient,
  });

  const hasMore = data?.objects?.pageInfo?.hasNextPage;

  const fetchMore = () =>
    fetchMoreInternal({
      variables: {
        afterCursor: data?.objects?.pageInfo?.endCursor,
      },
    });

  const metadataObjects = useMemo(() => {
    return formatPagedMetadataObjectsToMetadataObjects({
      pagedMetadataObjects: data,
    });
  }, [data]);

  const getMetadataObjectsFromCache = () => {
    const queryResult = apolloMetadataClient?.readQuery<
      MetadataObjectsQuery,
      MetadataObjectsQueryVariables
    >({
      query: FIND_MANY_METADATA_OBJECTS,
    });

    return formatPagedMetadataObjectsToMetadataObjects({
      pagedMetadataObjects: queryResult ?? undefined,
    });
  };

  return {
    metadataObjects,
    hasMore,
    fetchMore,
    getMetadataObjectsFromCache,
  };
};
