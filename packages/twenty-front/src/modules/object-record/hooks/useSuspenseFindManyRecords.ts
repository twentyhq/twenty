import { skipToken, useSuspenseQuery } from '@apollo/client/react';
import { useCallback } from 'react';

import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useFetchMoreRecordsWithPagination } from '@/object-record/hooks/useFetchMoreRecordsWithPagination';
import { type UseFindManyRecordsParams } from '@/object-record/hooks/useFindManyRecords';
import { useFindManyRecordsPrelude } from '@/object-record/hooks/useFindManyRecordsPrelude';
import { useFindManyRecordsResultEffects } from '@/object-record/hooks/useFindManyRecordsResultEffects';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { usePromiseTransition } from '@/ui/utilities/react-transition/hooks/usePromiseTransition';

import { QUERY_DEFAULT_LIMIT_RECORDS } from 'twenty-shared/constants';

export type UseSuspenseFindManyRecordsParams<T> = Omit<
  UseFindManyRecordsParams<T>,
  'fetchPolicy'
> & {
  fetchPolicy?:
    | 'cache-first'
    | 'network-only'
    | 'no-cache'
    | 'cache-and-network';
};

// Suspense sibling of useFindManyRecords: the shared prelude guarantees both
// hooks build the same query and cache entries. It starts fetching during
// render, which lets content inside a hidden <Activity> preload, and wraps
// fetchMore/refetch in transitions so they never re-trigger the Suspense
// fallback of an already rendered list.
export const useSuspenseFindManyRecords = <
  T extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  filter,
  orderBy,
  skip,
  recordGqlFields,
  fetchPolicy,
  onError,
  onCompleted,
  cursorFilter,
  limit = QUERY_DEFAULT_LIMIT_RECORDS,
  withSoftDeleted = false,
}: UseSuspenseFindManyRecordsParams<T>) => {
  const {
    objectMetadataItem,
    apolloCoreClient,
    findManyRecordsQuery,
    withSoftDeleteFilter,
    queryIdentifier,
    shouldSkip,
    handleFindManyRecordsCompleted,
    handleFindManyRecordsError,
  } = useFindManyRecordsPrelude<T>({
    objectNameSingular,
    filter,
    orderBy,
    skip,
    recordGqlFields,
    onError,
    onCompleted,
    cursorFilter,
    limit,
    withSoftDeleted,
  });

  const { data, error, fetchMore, refetch } =
    useSuspenseQuery<RecordGqlOperationFindManyResult>(
      findManyRecordsQuery,
      shouldSkip
        ? skipToken
        : {
            variables: {
              filter: withSoftDeleteFilter,
              orderBy,
              lastCursor: cursorFilter?.cursor ?? undefined,
              limit,
            },
            fetchPolicy,
            errorPolicy: 'all',
            client: apolloCoreClient,
          },
    );

  useFindManyRecordsResultEffects({
    data,
    error,
    handleFindManyRecordsCompleted,
    handleFindManyRecordsError,
  });

  const {
    isPending: isFetchingMoreRecords,
    startPromiseTransition: startFetchMorePromiseTransition,
  } = usePromiseTransition();

  const { fetchMoreRecords, records, hasNextPage } =
    useFetchMoreRecordsWithPagination<T>({
      objectNameSingular,
      filter: withSoftDeleteFilter,
      orderBy,
      limit,
      fetchMore,
      data,
      error,
      objectMetadataItem,
    });

  const fetchMoreRecordsInTransition = useCallback(async () => {
    await startFetchMorePromiseTransition(fetchMoreRecords);
  }, [fetchMoreRecords, startFetchMorePromiseTransition]);

  const {
    isPending: isRefetching,
    startPromiseTransition: startRefetchPromiseTransition,
  } = usePromiseTransition();

  const refetchInTransition = useCallback(async () => {
    await startRefetchPromiseTransition(refetch);
  }, [refetch, startRefetchPromiseTransition]);

  const pageInfo = data?.[objectMetadataItem.namePlural]?.pageInfo;

  const totalCount = data?.[objectMetadataItem.namePlural]?.totalCount;

  return {
    objectMetadataItem,
    records,
    totalCount,
    error,
    fetchMoreRecords: fetchMoreRecordsInTransition,
    isFetchingMoreRecords,
    isRefetching,
    queryIdentifier,
    hasNextPage,
    pageInfo,
    refetch: refetchInTransition,
  };
};
