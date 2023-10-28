import { useMemo } from 'react';
import { useQuery } from '@apollo/client';

import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';
import {
  MetadataObjectsQuery,
  MetadataObjectsQueryVariables,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';
import { formatPagedMetadataObjectsToMetadataObjects } from '../utils/formatPagedMetadataObjectsToMetadataObjects';

import { useApolloMetadataClient } from './useApolloMetadataClient';

// TODO: test fetchMore
export const useFindManyMetadataObjects = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const { enqueueSnackBar } = useSnackBar();

  const {
    data,
    fetchMore: fetchMoreInternal,
    loading,
    error,
  } = useQuery<MetadataObjectsQuery, MetadataObjectsQueryVariables>(
    FIND_MANY_METADATA_OBJECTS,
    {
      client: apolloMetadataClient ?? undefined,
      skip: !apolloMetadataClient,
      onError: (error) => {
        logError('useFindManyMetadataObjects error : ' + error);
        enqueueSnackBar(
          `Error during useFindManyMetadataObjects, ${error.message}`,
          {
            variant: 'error',
          },
        );
      },
      onCompleted: () => {},
    },
  );

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
    loading,
    error,
  };
};
