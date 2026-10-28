import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { type UseFindManyRecordsParams } from '@/object-record/hooks/useFindManyRecords';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { type LazyRecordQueryOptions } from '@/object-record/types/LazyRecordQueryOptions';
import { type ObjectRecordQueryProgress } from '@/object-record/types/ObjectRecordQueryProgress';
import { fetchAllRecordPagesOrThrow } from '@/object-record/utils/fetchAllRecordPagesOrThrow';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseLazyFetchAllRecordIdsParams<T> = Omit<
  UseFindManyRecordsParams<T>,
  'skip'
> & {
  pageSize?: number;
  delayMs?: number;
  maximumRequests?: number;
  shouldThrowOnIncompleteResult?: boolean;
};

export const useLazyFetchAllRecords = <T>({
  objectNameSingular,
  filter,
  orderBy,
  limit = DEFAULT_QUERY_PAGE_SIZE,
  delayMs = 0,
  maximumRequests = 100,
  shouldThrowOnIncompleteResult = false,
  recordGqlFields,
  fetchPolicy,
}: UseLazyFetchAllRecordIdsParams<T>) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<ObjectRecordQueryProgress>({
    displayType: 'number',
  });
  const { fetchMoreRecordsLazy, findManyRecordsLazy } = useLazyFindManyRecords({
    objectNameSingular,
    filter,
    orderBy,
    limit,
    recordGqlFields,
    fetchPolicy,
    shouldToastOnError: false,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const fetchAllRecords = useCallback(
    async (queryOptions: LazyRecordQueryOptions = {}) => {
      if (!isDefined(findManyRecordsLazy)) {
        return [];
      }
      setIsDownloading(true);

      try {
        return await fetchAllRecordPagesOrThrow({
          fetchFirstPage: async () => {
            const result = await findManyRecordsLazy(queryOptions);

            return {
              connection: result.data?.[objectMetadataItem.namePlural],
              error: result.error,
            };
          },
          fetchNextPage: async () => {
            const result = await fetchMoreRecordsLazy({
              limit,
              ...queryOptions,
            });

            if (isDefined(result) && 'error' in result) {
              return { error: result.error };
            }

            return { connection: result?.data };
          },
          maximumRequests,
          pageSize: limit,
          delayMs,
          shouldThrowOnIncompleteResult,
          onPageFetched: ({ processedRecordCount, totalRecordCount }) =>
            setProgress({
              processedRecordCount,
              totalRecordCount,
              displayType: totalRecordCount ? 'percentage' : 'number',
            }),
        });
      } finally {
        setIsDownloading(false);
        setProgress({
          displayType: 'number',
        });
      }
    },
    [
      delayMs,
      fetchMoreRecordsLazy,
      findManyRecordsLazy,
      objectMetadataItem.namePlural,
      limit,
      maximumRequests,
      shouldThrowOnIncompleteResult,
    ],
  );

  return {
    progress,
    isDownloading,
    fetchAllRecords,
    fetchFirstPage: findManyRecordsLazy,
  };
};
