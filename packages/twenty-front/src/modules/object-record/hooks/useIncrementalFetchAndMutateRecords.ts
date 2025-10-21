import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { type UseFindManyRecordsParams } from '@/object-record/hooks/useFetchMoreRecordsWithPagination';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { type ObjectRecordQueryProgress } from '@/object-record/types/ObjectRecordQueryProgress';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseIncrementalFetchAndMutateRecordsParams<T> = Omit<
  UseFindManyRecordsParams<T>,
  'skip'
> & {
  pageSize?: number;
};

type MutateRecordsBatchParams = {
  recordIds: string[];
  totalFetchedCount: number;
  totalCount: number;
};

export const useIncrementalFetchAndMutateRecords = <T>({
  objectNameSingular,
  filter,
  orderBy,
  limit = DEFAULT_QUERY_PAGE_SIZE,
  recordGqlFields,
}: UseIncrementalFetchAndMutateRecordsParams<T>) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ObjectRecordQueryProgress>({
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

  const incrementalFetchAndMutate = useCallback(
    async (
      mutateRecordsBatch: (params: MutateRecordsBatchParams) => Promise<void>,
    ) => {
      if (!isDefined(findManyRecordsLazy)) {
        return;
      }

      try {
        setIsProcessing(true);

        // Fetch first page to get total count
        const findManyRecordsDataResult = await findManyRecordsLazy();

        const firstQueryResult =
          findManyRecordsDataResult?.data?.[objectMetadataItem.namePlural];

        const totalCount = firstQueryResult?.totalCount ?? 0;
        const firstPageRecordIds =
          firstQueryResult?.edges?.map((edge) => edge.node.id) ?? [];

        setProgress({
          processedRecordCount: 0,
          totalRecordCount: totalCount,
          displayType: totalCount ? 'percentage' : 'number',
        });

        let totalFetchedCount = firstPageRecordIds.length;

        if (firstPageRecordIds.length > 0) {
          await mutateRecordsBatch({
            recordIds: firstPageRecordIds,
            totalFetchedCount,
            totalCount,
          });
        }

        const remainingCount = totalCount - firstPageRecordIds.length;
        const remainingPages = Math.ceil(remainingCount / limit);
        let lastCursor = firstQueryResult?.pageInfo.endCursor ?? null;

        for (let pageIndex = 0; pageIndex < remainingPages; pageIndex++) {
          if (lastCursor === null) {
            break;
          }

          if (!isDefined(fetchMoreRecordsLazy)) {
            break;
          }

          const rawResult = await fetchMoreRecordsLazy();
          const fetchMoreResult = rawResult?.data;

          const currentPageRecordIds =
            fetchMoreResult?.edges?.map((edge) => edge.node.id) ?? [];

          totalFetchedCount += currentPageRecordIds.length;

          if (currentPageRecordIds.length > 0) {
            await mutateRecordsBatch({
              recordIds: currentPageRecordIds,
              totalFetchedCount,
              totalCount,
            });
          }

          if (fetchMoreResult?.pageInfo.hasNextPage === false) {
            break;
          }

          lastCursor = fetchMoreResult?.pageInfo.endCursor ?? null;
        }
      } finally {
        // Always reset state even if an error occurs
        setIsProcessing(false);
        setProgress({
          displayType: 'number',
        });
      }
    },
    [
      fetchMoreRecordsLazy,
      findManyRecordsLazy,
      objectMetadataItem.namePlural,
      limit,
    ],
  );

  const updateProgress = useCallback(
    (processedRecordCount: number, totalRecordCount: number) => {
      setProgress({
        processedRecordCount,
        totalRecordCount,
        displayType: totalRecordCount ? 'percentage' : 'number',
      });
    },
    [],
  );

  return {
    progress,
    isProcessing,
    incrementalFetchAndMutate,
    updateProgress,
  };
};
