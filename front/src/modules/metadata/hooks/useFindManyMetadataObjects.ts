import { useMemo } from 'react';
import { useQuery } from '@apollo/client';

import {
  MetadataObjectsQuery,
  MetadataObjectsQueryVariables,
} from '~/generated-metadata/graphql';

import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';
import { formatPagedMetadataObjectsToMetadataObjects } from '../utils/formatPagedMetadataObjectsToMetadataObjects';

import { useApolloClientMetadata } from './useApolloClientMetadata';

// TODO: test fetchMore
export const useFindManyMetadataObjects = () => {
  const apolloClientMetadata = useApolloClientMetadata();

  const { data, fetchMore: fetchMoreInternal } = useQuery<
    MetadataObjectsQuery,
    MetadataObjectsQueryVariables
  >(FIND_MANY_METADATA_OBJECTS, {
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
