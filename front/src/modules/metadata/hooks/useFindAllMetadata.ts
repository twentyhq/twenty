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
export const useFindAllMetadata = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const { data, fetchMore: fetchMoreInternal } = useQuery<
    MetadataObjectsQuery,
    MetadataObjectsQueryVariables
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

  const metadataObjects = useMemo(() => {
    return formatPagedMetadataObjectsToMetadataObjects({
      pagedMetadataObjects: data,
    });
  }, [data]);

  return {
    metadataObjects,
    hasMore,
    fetchMore,
  };
};
