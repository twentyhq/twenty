import { useQuery, type WatchQueryFetchPolicy } from '@apollo/client';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { type RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { useFetchMoreRecordsWithPagination } from '@/object-record/hooks/useFetchMoreRecordsWithPagination';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useHandleFindManyRecordsCompleted } from '@/object-record/hooks/useHandleFindManyRecordsCompleted';
import { useHandleFindManyRecordsError } from '@/object-record/hooks/useHandleFindManyRecordsError';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type OnFindManyRecordsCompleted } from '@/object-record/types/OnFindManyRecordsCompleted';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';

import { QUERY_DEFAULT_LIMIT_RECORDS } from 'twenty-shared/constants';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

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

  const { data, loading, error, fetchMore, refetch } =
    useQuery<RecordGqlOperationFindManyResult>(findManyRecordsQuery, {
      skip: skip || !objectMetadataItem || !hasReadPermission,
      variables: {
        filter: withSoftDeleteFilter,
        orderBy,
        lastCursor: cursorFilter?.cursor ?? undefined,
        limit,
      },
      fetchPolicy: fetchPolicy,
      onCompleted: handleFindManyRecordsCompleted,
      onError: handleFindManyRecordsError,
      client: apolloCoreClient,
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
