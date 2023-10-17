import { useMemo } from 'react';
import { useQuery } from '@apollo/client';

import {
  MetadataObjectsQuery,
  MetadataObjectsQueryVariables,
} from '~/generated-metadata/graphql';

import { GET_ALL_OBJECTS } from '../graphql/queries';
import { formatPagedMetadataObjectsToMetadataObjects } from '../utils/formatPagedMetadataObjectsToMetadataObjects';

import { useApolloClientMetadata } from './useApolloClientMetadata';

// TODO: test fetchMore
export const useFindAllMetadata = () => {
  const apolloClientMetadata = useApolloClientMetadata();

  const { data, fetchMore: fetchMoreInternal } = useQuery<
    MetadataObjectsQuery,
    MetadataObjectsQueryVariables
  >(GET_ALL_OBJECTS, {
    client: apolloClientMetadata ?? ({} as any),
    skip: !apolloClientMetadata,
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
