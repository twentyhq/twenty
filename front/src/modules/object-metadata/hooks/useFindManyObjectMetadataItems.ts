import { useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';
import {
  FieldFilter,
  ObjectFilter,
  ObjectMetadataItemsQuery,
  ObjectMetadataItemsQueryVariables,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { logError } from '~/utils/logError';

import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '../utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';

import { useApolloMetadataClient } from './useApolloMetadataClient';

// TODO: test fetchMore
export const useFindManyObjectMetadataItems = ({
  skip,
  objectFilter,
  fieldFilter,
}: {
  skip?: boolean;
  objectFilter?: ObjectFilter;
  fieldFilter?: FieldFilter;
} = {}) => {
  const apolloMetadataClient = useApolloMetadataClient();

  const { enqueueSnackBar } = useSnackBar();

  console.log('useFindManyObjectMetadataItems');

  const {
    data,
    fetchMore: fetchMoreInternal,
    loading,
    error,
  } = useQuery<ObjectMetadataItemsQuery, ObjectMetadataItemsQueryVariables>(
    FIND_MANY_METADATA_OBJECTS,
    {
      variables: {
        objectFilter,
        fieldFilter,
      },
      client: apolloMetadataClient ?? undefined,
      skip: skip || !apolloMetadataClient,
      onError: (error) => {
        logError('useFindManyObjectMetadataItems error : ' + error);
        enqueueSnackBar(
          `Error during useFindManyObjectMetadataItems, ${error.message}`,
          {
            variant: 'error',
          },
        );
      },
      onCompleted: useRecoilCallback(
        ({ snapshot, set }) =>
          (data) => {
            const objectMetadataItems =
              mapPaginatedObjectMetadataItemsToObjectMetadataItems({
                pagedObjectMetadataItems: data,
              });

            const actualObjectMetadataItems = snapshot
              .getLoadable(objectMetadataItemsState)
              .getValue();

            if (
              !isDeeplyEqual(objectMetadataItems, actualObjectMetadataItems)
            ) {
              set(objectMetadataItemsState, objectMetadataItems);
            }
          },
        [],
      ),
    },
  );

  const hasMore = useMemo(
    () => data?.objects?.pageInfo?.hasNextPage,
    [data?.objects?.pageInfo?.hasNextPage],
  );

  const fetchMore = useCallback(() => {
    const returnedData = fetchMoreInternal({
      variables: {
        afterCursor: data?.objects?.pageInfo?.endCursor,
      },
    });

    return returnedData;
  }, [data?.objects?.pageInfo?.endCursor, fetchMoreInternal]);

  // useEffect(() => {
  //   console.log({ hasMore, fetchMore });
  //   if (hasMore) {
  //     fetchMore();
  //   }
  // }, [hasMore, fetchMore]);

  const objectMetadataItems = useMemo(() => {
    return mapPaginatedObjectMetadataItemsToObjectMetadataItems({
      pagedObjectMetadataItems: data,
    });
  }, [data]);

  return {
    objectMetadataItems,
    hasMore,
    fetchMore,
    loading,
    error,
  };
};
