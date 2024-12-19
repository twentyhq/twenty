import { useQuery, WatchQueryFetchPolicy } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { useFetchMoreRecordsWithPagination } from '@/object-record/hooks/useFetchMoreRecordsWithPagination';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useHandleFindManyRecordsCompleted } from '@/object-record/hooks/useHandleFindManyRecordsCompleted';
import { useHandleFindManyRecordsError } from '@/object-record/hooks/useHandleFindManyRecordsError';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { OnFindManyRecordsCompleted } from '@/object-record/types/OnFindManyRecordsCompleted';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';

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
  limit,
  skip,
  recordGqlFields,
  fetchPolicy,
  onError,
  onCompleted,
  cursorFilter,
  withSoftDeleted = false,
}: UseFindManyRecordsParams<T>) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular,
    recordGqlFields,
    cursorDirection: cursorFilter?.cursorDirection,
  });

  const { handleFindManyRecordsError } = useHandleFindManyRecordsError({
    objectMetadataItem,
    handleError: onError,
  });

  const queryIdentifier = getQueryIdentifier({
    objectNameSingular,
    filter,
    orderBy,
    limit,
  });

  const { handleFindManyRecordsCompleted } = useHandleFindManyRecordsCompleted({
    objectMetadataItem,
    queryIdentifier,
    onCompleted,
  });

  const withSoftDeleterFilter = {
    or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
  };

  const { data, loading, error, fetchMore } =
    useQuery<RecordGqlOperationFindManyResult>(findManyRecordsQuery, {
      skip: skip || !objectMetadataItem,
      variables: {
        filter: {
          ...filter,
          ...(withSoftDeleted ? withSoftDeleterFilter : {}),
        },
        orderBy,
        lastCursor: cursorFilter?.cursor ?? undefined,
        limit: cursorFilter?.limit ?? limit,
      },
      fetchPolicy: fetchPolicy,
      onCompleted: handleFindManyRecordsCompleted,
      onError: handleFindManyRecordsError,
    });

  const { fetchMoreRecords, records, hasNextPage } =
    useFetchMoreRecordsWithPagination<T>({
      objectNameSingular,
      filter,
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
    queryStateIdentifier: queryIdentifier,
    hasNextPage,
    pageInfo,
  };
};
