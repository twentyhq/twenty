import { type WatchQueryFetchPolicy } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

import { type ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useFetchMoreRecordsWithPagination } from '@/object-record/hooks/useFetchMoreRecordsWithPagination';
import { useFindManyRecordsPrelude } from '@/object-record/hooks/useFindManyRecordsPrelude';
import { useFindManyRecordsResultEffects } from '@/object-record/hooks/useFindManyRecordsResultEffects';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type OnFindManyRecordsCompleted } from '@/object-record/types/OnFindManyRecordsCompleted';
import {
  type RecordGqlOperationGqlRecordFields,
  type RecordGqlOperationVariables,
} from 'twenty-shared/types';

import { QUERY_DEFAULT_LIMIT_RECORDS } from 'twenty-shared/constants';

export type UseFindManyRecordsParams<T> = ObjectMetadataItemIdentifier &
  RecordGqlOperationVariables & {
    onError?: (error?: Error) => void;
    onCompleted?: OnFindManyRecordsCompleted<T>;
    skip?: boolean;
    recordGqlFields?: RecordGqlOperationGqlRecordFields;
    fetchPolicy?: WatchQueryFetchPolicy;
    withSoftDeleted?: boolean;
  };

export const useFindManyRecords = <T extends ObjectRecord = ObjectRecord>({
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
}: UseFindManyRecordsParams<T>) => {
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

  const { data, loading, error, fetchMore, refetch } =
    useQuery<RecordGqlOperationFindManyResult>(findManyRecordsQuery, {
      skip: shouldSkip,
      variables: {
        filter: withSoftDeleteFilter,
        orderBy,
        lastCursor: cursorFilter?.cursor ?? undefined,
        limit,
      },
      fetchPolicy: fetchPolicy,
      client: apolloCoreClient,
    });

  useFindManyRecordsResultEffects({
    data,
    error,
    handleFindManyRecordsCompleted,
    handleFindManyRecordsError,
  });

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

  const pageInfo = data?.[objectMetadataItem.namePlural]?.pageInfo;

  const totalCount = data?.[objectMetadataItem.namePlural]?.totalCount;

  return {
    objectMetadataItem,
    records,
    totalCount,
    loading,
    error,
    fetchMoreRecords,
    queryIdentifier,
    hasNextPage,
    pageInfo,
    refetch,
  };
};
