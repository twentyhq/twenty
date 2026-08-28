import { skipToken, useSuspenseQuery } from '@apollo/client/react';
import { useCallback, useEffect, useTransition } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useFetchMoreRecordsWithPagination } from '@/object-record/hooks/useFetchMoreRecordsWithPagination';
import { type UseFindManyRecordsParams } from '@/object-record/hooks/useFindManyRecords';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useHandleFindManyRecordsCompleted } from '@/object-record/hooks/useHandleFindManyRecordsCompleted';
import { useHandleFindManyRecordsError } from '@/object-record/hooks/useHandleFindManyRecordsError';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

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

// Suspense sibling of useFindManyRecords: same query document, variables and
// pagination state, so both hooks share cache entries. It starts fetching
// during render, which lets content inside a hidden <Activity> preload, and
// wraps fetchMore/refetch in transitions so they never re-trigger the
// Suspense fallback of an already rendered list.
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
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const apolloCoreClient = useApolloCoreClient();
  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular,
    recordGqlFields,
    cursorDirection: cursorFilter?.cursorDirection,
  });

  const { handleFindManyRecordsError } = useHandleFindManyRecordsError({
    objectMetadataItem,
    handleError: onError,
  });

  const softDeleteFilter: RecordGqlOperationFilter = {
    or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
  };

  const withSoftDeleteFilter = withSoftDeleted
    ? {
        and: [...(filter ? [filter] : []), softDeleteFilter],
      }
    : filter;

  const queryIdentifier = getQueryIdentifier({
    objectNameSingular,
    filter: withSoftDeleteFilter,
    orderBy,
    limit,
  });

  const { handleFindManyRecordsCompleted } = useHandleFindManyRecordsCompleted({
    objectMetadataItem,
    queryIdentifier,
    onCompleted,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasReadPermission = objectPermissions.canReadObjectRecords;

  const shouldSkip =
    skip || !isDefined(objectMetadataItem) || !hasReadPermission;

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

  useEffect(() => {
    if (isDefined(data)) {
      handleFindManyRecordsCompleted(data);
    }
  }, [data, handleFindManyRecordsCompleted]);

  useEffect(() => {
    if (isDefined(error)) {
      handleFindManyRecordsError(error);
    }
  }, [error, handleFindManyRecordsError]);

  const [isFetchingMoreRecords, startFetchMoreTransition] = useTransition();

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

  const fetchMoreRecordsInTransition = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        startFetchMoreTransition(async () => {
          try {
            await fetchMoreRecords();
            resolve();
          } catch (fetchMoreError) {
            reject(fetchMoreError);
          }
        });
      }),
    [fetchMoreRecords, startFetchMoreTransition],
  );

  const [isRefetching, startRefetchTransition] = useTransition();

  const refetchInTransition = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        startRefetchTransition(async () => {
          try {
            await refetch();
            resolve();
          } catch (refetchError) {
            reject(refetchError);
          }
        });
      }),
    [refetch, startRefetchTransition],
  );

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
