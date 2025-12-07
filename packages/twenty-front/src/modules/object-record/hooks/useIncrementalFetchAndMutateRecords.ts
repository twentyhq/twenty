import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { type UseFindManyRecordsParams } from '@/object-record/hooks/useFetchMoreRecordsWithPagination';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { type ObjectRecordQueryProgress } from '@/object-record/types/ObjectRecordQueryProgress';
import { useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseIncrementalFetchAndMutateRecordsParams<T> = Omit<
  UseFindManyRecordsParams<T>,
  'skip'
>;

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

  const abortControllerRef = useRef<AbortController | null>(null);

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

  const incrementalFetchAndMutate = async (
    mutateRecordsBatch: (params: MutateRecordsBatchParams) => Promise<void>,
  ) => {
    if (!isDefined(findManyRecordsLazy)) {
      return;
    }

    try {
      setIsProcessing(true);
      abortControllerRef.current = new AbortController();

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
        if (lastCursor === null || abortControllerRef.current?.signal.aborted) {
          break;
        }

        if (!isDefined(fetchMoreRecordsLazy)) {
          break;
        }

        const rawResult = await fetchMoreRecordsLazy(limit);
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
      setIsProcessing(false);
      setProgress({
        displayType: 'number',
      });
      abortControllerRef.current = null;
    }
  };

  const cancel = () => {
    abortControllerRef.current?.abort();
  };

  const updateProgress = (
    processedRecordCount: number,
    totalRecordCount: number,
  ) => {
    setProgress({
      processedRecordCount,
      totalRecordCount,
      displayType: totalRecordCount ? 'percentage' : 'number',
    });
  };

  return {
    progress,
    isProcessing,
    incrementalFetchAndMutate,
    updateProgress,
    cancel,
  };
};
