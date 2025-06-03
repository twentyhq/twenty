import { useLazyQuery } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useFetchMoreRecordsWithPagination } from '@/object-record/hooks/useFetchMoreRecordsWithPagination';
import { UseFindManyRecordsParams } from '@/object-record/hooks/useFindManyRecords';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useHandleFindManyRecordsCompleted } from '@/object-record/hooks/useHandleFindManyRecordsCompleted';
import { useHandleFindManyRecordsError } from '@/object-record/hooks/useHandleFindManyRecordsError';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { cursorFamilyState } from '@/object-record/states/cursorFamilyState';
import { hasNextPageFamilyState } from '@/object-record/states/hasNextPageFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';

type UseLazyFindManyRecordsParams<T> = Omit<
  UseFindManyRecordsParams<T>,
  'skip'
>;

export const useLazyFindManyRecords = <T extends ObjectRecord = ObjectRecord>({
  objectNameSingular,
  filter,
  orderBy,
  limit,
  recordGqlFields,
  fetchPolicy,
  onCompleted,
  onError,
}: UseLazyFindManyRecordsParams<T>) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular,
    recordGqlFields,
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

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const hasReadPermission =
    objectPermissionsByObjectMetadataId[objectMetadataItem.id]
      ?.canReadObjectRecords === true;

  const [findManyRecords, { data, loading, error, fetchMore }] =
    useLazyQuery<RecordGqlOperationFindManyResult>(findManyRecordsQuery, {
      variables: {
        filter,
        limit,
        orderBy,
      },
      fetchPolicy: fetchPolicy,
      onCompleted: handleFindManyRecordsCompleted,
      onError: handleFindManyRecordsError,
    });

  const { fetchMoreRecords, totalCount, records, hasNextPage } =
    useFetchMoreRecordsWithPagination<T>({
      objectNameSingular,
      filter,
      orderBy,
      limit,
      onCompleted,
      fetchMore,
      data,
      error,
      objectMetadataItem,
    });

  const findManyRecordsLazy = useRecoilCallback(
    ({ set }) =>
      async () => {
        if (!hasReadPermission) {
          set(hasNextPageFamilyState(queryIdentifier), false);
          set(cursorFamilyState(queryIdentifier), '');

          onCompleted?.([]);

          return {
            data: null,
            loading: false,
            error: undefined,
            called: true,
          };
        }

        const result = await findManyRecords();

        const hasNextPage =
          result?.data?.[objectMetadataItem.namePlural]?.pageInfo.hasNextPage ??
          false;

        const lastCursor =
          result?.data?.[objectMetadataItem.namePlural]?.pageInfo.endCursor ??
          '';

        set(hasNextPageFamilyState(queryIdentifier), hasNextPage);
        set(cursorFamilyState(queryIdentifier), lastCursor);

        return result;
      },
    [
      hasReadPermission,
      findManyRecords,
      objectMetadataItem.namePlural,
      queryIdentifier,
      onCompleted,
    ],
  );

  return {
    objectMetadataItem,
    records,
    totalCount,
    loading: hasReadPermission ? loading : false,
    error: hasReadPermission ? error : undefined,
    fetchMore,
    fetchMoreRecords,
    queryStateIdentifier: queryIdentifier,
    findManyRecords: findManyRecordsLazy,
    hasNextPage,
    hasReadPermission,
  };
};
