import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { UseFindManyRecordsParams } from '@/object-record/hooks/useFetchMoreRecordsWithPagination';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useCallback } from 'react';
import { isDefined } from '~/utils/isDefined';

type UseLazyFetchAllRecordIdsParams<T> = Omit<
  UseFindManyRecordsParams<T>,
  'skip'
> & { pageSize?: number };

export const useFetchAllRecordIds = <T>({
  objectNameSingular,
  filter,
  orderBy,
  pageSize = DEFAULT_QUERY_PAGE_SIZE,
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

    const remainingPages = Math.ceil(remainingCount / pageSize);

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
    }

    const recordIds = Array.from(recordIdSet);

    return recordIds;
  }, [fetchMore, findManyRecords, objectMetadataItem.namePlural, pageSize]);

  return {
    fetchAllRecordIds,
  };
};
