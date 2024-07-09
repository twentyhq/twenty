import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { UseFindManyRecordsParams } from '@/object-record/hooks/useFetchMoreRecordsWithPagination';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useCallback } from 'react';
import { isDefined } from '~/utils/isDefined';

type UseLazyFetchAllRecordIdsParams<T> = Omit<
  UseFindManyRecordsParams<T>,
  'skip'
>;

export const useFetchAllRecordIds = <T>({
  objectNameSingular,
  filter,
  orderBy,
}: UseLazyFetchAllRecordIdsParams<T>) => {
  const { fetchMore, findManyRecords } = useLazyFindManyRecords({
    objectNameSingular,
    filter,
    orderBy,
    recordGqlFields: { id: true },
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const fetchAllRecordIds = useCallback(async () => {
    console.log({
      objectNameSingular,
    });
    if (!isDefined(findManyRecords)) {
      return [];
    }

    const findManyRecordsDataResult = await findManyRecords();

    const firstQueryResult =
      findManyRecordsDataResult?.data?.[objectMetadataItem.namePlural];

    const totalCount = firstQueryResult?.totalCount ?? 1;

    const recordsCount = firstQueryResult?.edges.length ?? 0;

    const recordIdSet = new Set(
      firstQueryResult?.edges?.map((edge) => edge.node.id) ?? [],
    );

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

      console.log({
        lastCursor,
        newProgress,
        fetchMoreResult,
      });
    }
    const recordIds = Array.from(recordIdSet);

    return recordIds;
  }, [
    fetchMore,
    findManyRecords,
    objectMetadataItem.namePlural,
    objectNameSingular,
  ]);

  return {
    fetchAllRecordIds,
  };
};
