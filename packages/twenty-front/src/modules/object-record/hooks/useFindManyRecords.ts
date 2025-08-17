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

// add this type so we can precisely narrow the composed filter
import { type RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';

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

  // Soft-deleted clause typed as a valid GraphQL filter
  const withSoftDeleterFilter: RecordGqlOperationFilter = {
    or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
  } as RecordGqlOperationFilter;

  // Base UI filter narrowed to the same filter type (or undefined)
  const baseFilter = filter as RecordGqlOperationFilter | undefined;

  // Compose once (include soft-deleted if requested), keep exact type
  const combinedFilter: RecordGqlOperationFilter | undefined = withSoftDeleted
    ? ({
        and: [
          ...(baseFilter ? [baseFilter] : []),
          withSoftDeleterFilter,
        ],
      } as RecordGqlOperationFilter)
    : baseFilter;

  const queryIdentifier = getQueryIdentifier({
    objectNameSingular,
    filter: combinedFilter, // use the same composed predicate for cache key
    orderBy,
    limit,
  });

  // Recreate completed handler with the final identifier
  const { handleFindManyRecordsCompleted: handleCompleted } =
    useHandleFindManyRecordsCompleted({
      objectMetadataItem,
      queryIdentifier,
      onCompleted,
    });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasReadPermission = objectPermissions.canReadObjectRecords;

  const { data, loading, error, fetchMore } =
    useQuery<RecordGqlOperationFindManyResult>(findManyRecordsQuery, {
      skip: skip || !objectMetadataItem || !hasReadPermission,
      variables: {
        filter: combinedFilter, // SAME filter goes to the query
        orderBy,
        lastCursor: cursorFilter?.cursor ?? undefined,
        limit,
      },
      fetchPolicy: fetchPolicy,
      onCompleted: handleCompleted,
      onError: handleFindManyRecordsError,
      client: apolloCoreClient,
    });

  const { fetchMoreRecords, records, hasNextPage } =
    useFetchMoreRecordsWithPagination<T>({
      objectNameSingular,
      // Pass the same composed filter; cast retains the original param shape
      filter: combinedFilter as typeof filter,
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
  };
};
