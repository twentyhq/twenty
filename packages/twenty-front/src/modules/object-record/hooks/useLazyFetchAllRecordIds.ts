import { useState } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { UseFindManyRecordsParams } from '@/object-record/hooks/useFetchMoreRecordsWithPagination';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { isDefined } from '~/utils/isDefined';

type UseLazyFetchAllRecordIdsParams<T> = Omit<
  UseFindManyRecordsParams<T>,
  'skip'
>;

type FetchAllRecordIdsStatus = 'idle' | 'loading' | 'success' | 'error';

export const useLazyFetchAllRecordIds = <T>({
  objectNameSingular,
  filter,
  orderBy,
  callback,
}: UseLazyFetchAllRecordIdsParams<T> & {
  callback?: (recordIds: string[]) => void;
}) => {
  const [fetchProgress, setFetchProgress] = useState(0);
  const [fetchStatus, setFetchStatus] =
    useState<FetchAllRecordIdsStatus>('idle');

  const { fetchMore, findManyRecords } = useLazyFindManyRecords({
    objectNameSingular,
    filter,
    orderBy,
    recordGqlFields: { id: true },
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const fetchAllRecordIds = async () => {
    setFetchStatus('loading');
    setFetchProgress(0);

    if (!isDefined(findManyRecords)) {
      return;
    }

    const findManyRecordsDataResult = await findManyRecords();

    const firstQueryResult =
      findManyRecordsDataResult?.data?.[objectMetadataItem.namePlural];

    const totalCount = firstQueryResult?.totalCount ?? 1;

    const recordsCount = firstQueryResult?.edges.length ?? 0;

    const progress = Math.round((recordsCount / totalCount) * 100);

    setFetchProgress(progress);

    const recordIdSet = new Set(
      firstQueryResult?.edges?.map((edge) => edge.node.id) ?? [],
    );

    console.log({
      records: recordIdSet,
      queryResult: firstQueryResult,
      totalCount,
      progress,
    });

    const remainingCount = totalCount - recordsCount;

    const remainingPages = Math.ceil(remainingCount / 30);

    let lastCursor = firstQueryResult?.pageInfo.endCursor ?? '';

    for (let i = 0; i < remainingPages; i++) {
      const rawResult = await fetchMore?.({
        variables: {
          lastCursor: lastCursor,
        },
      });

      const fetchMoreResult = rawResult?.data?.[objectMetadataItem.namePlural];

      for (const edge of fetchMoreResult.edges) {
        recordIdSet.add(edge.node.id);
      }

      lastCursor = fetchMoreResult.pageInfo.endCursor ?? '';

      const newProgress = Math.round((recordIdSet.size / totalCount) * 100);

      setFetchProgress(newProgress);

      console.log({
        lastCursor,
        newProgress,
        fetchMoreResult,
      });
    }

    setFetchStatus('success');
    setFetchProgress(100);

    const recordIds = Array.from(recordIdSet);

    callback?.(recordIds);

    return recordIds;
  };

  return {
    fetchAllRecordIds,
    fetchProgress,
    fetchStatus,
  };
};
