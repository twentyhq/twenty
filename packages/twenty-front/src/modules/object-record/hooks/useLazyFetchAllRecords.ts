import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { UseFindManyRecordsParams } from '@/object-record/hooks/useFetchMoreRecordsWithPagination';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { sleep } from '~/utils/sleep';

type UseLazyFetchAllRecordIdsParams<T> = Omit<
  UseFindManyRecordsParams<T>,
  'skip'
> & {
  pageSize?: number;
  delayMs?: number;
  maximumRequests?: number;
};

type ExportProgress = {
  exportedRecordCount?: number;
  totalRecordCount?: number;
  displayType: 'percentage' | 'number';
};

export const useLazyFetchAllRecords = <T>({
  objectNameSingular,
  filter,
  orderBy,
  limit = DEFAULT_QUERY_PAGE_SIZE,
  delayMs = 0,
  maximumRequests = 100,
  recordGqlFields,
}: UseLazyFetchAllRecordIdsParams<T>) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<ExportProgress>({
    displayType: 'number',
  });
  const { fetchMoreRecordsLazy, findManyRecordsLazy } = useLazyFindManyRecords({
    objectNameSingular,
    filter,
    orderBy,
    limit,
    recordGqlFields,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const fetchAllRecords = useCallback(async () => {
    if (!isDefined(findManyRecordsLazy)) {
      return [];
    }
    setIsDownloading(true);

    const findManyRecordsDataResult = await findManyRecordsLazy();

    const firstQueryResult =
      findManyRecordsDataResult?.data?.[objectMetadataItem.namePlural];

    const totalCount = firstQueryResult?.totalCount ?? 0;

    const recordsCount = firstQueryResult?.edges.length ?? 0;

    const records = firstQueryResult?.edges?.map((edge) => edge.node) ?? [];

    setProgress({
      exportedRecordCount: recordsCount,
      totalRecordCount: totalCount,
      displayType: totalCount ? 'percentage' : 'number',
    });

    const remainingCount = totalCount - recordsCount;

    const remainingPages = Math.ceil(remainingCount / limit);

    let lastCursor = firstQueryResult?.pageInfo.endCursor ?? null;

    for (
      let pageIndex = 0;
      pageIndex < Math.min(maximumRequests, remainingPages);
      pageIndex++
    ) {
      if (lastCursor === null) {
        break;
      }

      if (!isDefined(fetchMoreRecordsLazy)) {
        break;
      }

      if (delayMs > 0) {
        await sleep(delayMs);
      }

      const rawResult = await fetchMoreRecordsLazy();

      const fetchMoreResult = rawResult?.data;

      for (const edge of fetchMoreResult?.edges ?? []) {
        records.push(edge.node);
      }

      setProgress({
        exportedRecordCount: records.length,
        totalRecordCount: totalCount,
        displayType: totalCount ? 'percentage' : 'number',
      });

      if (fetchMoreResult?.pageInfo.hasNextPage === false) {
        break;
      }

      lastCursor = fetchMoreResult?.pageInfo.endCursor ?? null;
    }

    setIsDownloading(false);
    setProgress({
      displayType: 'number',
    });

    return records;
  }, [
    delayMs,
    fetchMoreRecordsLazy,
    findManyRecordsLazy,
    objectMetadataItem.namePlural,
    limit,
    maximumRequests,
  ]);

  return {
    progress,
    isDownloading,
    fetchAllRecords,
  };
};
