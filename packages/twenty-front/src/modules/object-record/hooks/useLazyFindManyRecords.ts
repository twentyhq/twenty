import { useLazyQuery } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { type UseFindManyRecordsParams } from '@/object-record/hooks/useFindManyRecords';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useHandleFindManyRecordsError } from '@/object-record/hooks/useHandleFindManyRecordsError';
import { useLazyFetchMoreRecordsWithPagination } from '@/object-record/hooks/useLazyFetchMoreRecordsWithPagination';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { cursorFamilyState } from '@/object-record/states/cursorFamilyState';
import { hasNextPageFamilyState } from '@/object-record/states/hasNextPageFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';
import { QUERY_DEFAULT_LIMIT_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

type UseLazyFindManyRecordsParams<T> = Omit<
  UseFindManyRecordsParams<T>,
  'skip' | 'onCompleted' | 'onError'
>;

export const useLazyFindManyRecords = <T extends ObjectRecord = ObjectRecord>({
  objectNameSingular,
  filter,
  orderBy,
  limit = QUERY_DEFAULT_LIMIT_RECORDS,
  recordGqlFields,
  fetchPolicy = 'cache-first',
}: UseLazyFindManyRecordsParams<T>) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const apolloCoreClient = useApolloCoreClient();

  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular,
    recordGqlFields,
  });

  const { handleFindManyRecordsError } = useHandleFindManyRecordsError({
    objectMetadataItem,
  });

  const queryIdentifier = getQueryIdentifier({
    objectNameSingular,
    filter,
    orderBy,
    limit,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasReadPermission = objectPermissions.canReadObjectRecords;

  const [findManyRecords, { data, error, fetchMore }] =
    useLazyQuery<RecordGqlOperationFindManyResult>(findManyRecordsQuery, {
      variables: {
        filter,
        limit,
        orderBy,
      },
      fetchPolicy,
      client: apolloCoreClient,
    });

  const { fetchMoreRecordsLazy } = useLazyFetchMoreRecordsWithPagination<T>({
    objectNameSingular,
    filter,
    orderBy,
    limit,
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

          return {
            data: null,
            records: null,
            totalCount: 0,
            hasNextPage: false,
            error: undefined,
          };
        }

        const result = await findManyRecords();
        if (isDefined(result?.error)) {
          handleFindManyRecordsError(result.error);
        }

        const hasNextPage =
          result?.data?.[objectMetadataItem.namePlural]?.pageInfo.hasNextPage ??
          false;

        const lastCursor =
          result?.data?.[objectMetadataItem.namePlural]?.pageInfo.endCursor ??
          '';

        set(hasNextPageFamilyState(queryIdentifier), hasNextPage);
        set(cursorFamilyState(queryIdentifier), lastCursor);

        const records = getRecordsFromRecordConnection({
          recordConnection: {
            edges: result?.data?.[objectMetadataItem.namePlural]?.edges ?? [],
            pageInfo: result?.data?.[objectMetadataItem.namePlural]
              ?.pageInfo ?? {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '',
              endCursor: '',
            },
          },
        });

        const totalCount =
          result?.data?.[objectMetadataItem.namePlural]?.totalCount ?? 0;

        return {
          data: result?.data,
          records,
          totalCount,
          hasNextPage,
          error: result?.error,
        };
      },
    [
      hasReadPermission,
      findManyRecords,
      objectMetadataItem.namePlural,
      queryIdentifier,
      handleFindManyRecordsError,
    ],
  );

  return {
    findManyRecordsLazy,
    fetchMoreRecordsLazy,
    queryIdentifier,
  };
};
