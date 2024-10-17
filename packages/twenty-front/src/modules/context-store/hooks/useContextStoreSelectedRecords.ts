import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreTargetedRecordsFiltersState } from '@/context-store/states/contextStoreTargetedRecordsFilters';
import { contextStoreTargetedRecordsState } from '@/context-store/states/contextStoreTargetedRecordsState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { useFetchAllRecordIds } from '@/object-record/hooks/useFetchAllRecordIds';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { turnFiltersIntoQueryFilter } from '@/object-record/record-filter/utils/turnFiltersIntoQueryFilter';
import { useFindManyParams } from '@/object-record/record-index/hooks/useLoadRecordIndexTable';
import { makeAndFilterVariables } from '@/object-record/utils/makeAndFilterVariables';
import { useRecoilValue } from 'recoil';

const getFilterForSelectedRecords = (
  selectedRecordIds: string[] | 'all',
  excludedRecordIds: string[],
  queryFilter: any,
) => {
  if (selectedRecordIds === 'all') {
    if (excludedRecordIds.length > 0) {
      return makeAndFilterVariables([
        queryFilter,
        {
          not: {
            id: {
              in: excludedRecordIds,
            },
          },
        },
      ]);
    }
    return queryFilter;
  }

  return makeAndFilterVariables([
    queryFilter,
    {
      id: {
        in: selectedRecordIds,
      },
    },
  ]);
};

export const useContextStoreSelectedRecords = ({
  limit = undefined,
  recordGqlFields,
}: {
  limit?: number;
  recordGqlFields?: RecordGqlFields;
}) => {
  const contextStoreTargetedRecords = useRecoilValue(
    contextStoreTargetedRecordsState,
  );

  const contextStoreCurrentObjectMetadataId = useRecoilValue(
    contextStoreCurrentObjectMetadataIdState,
  );

  const contextStoreTargetedRecordsFilters = useRecoilValue(
    contextStoreTargetedRecordsFiltersState,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataId,
  });
  const queryFilter = turnFiltersIntoQueryFilter(
    contextStoreTargetedRecordsFilters,
    objectMetadataItem?.fields ?? [],
  );

  const { selectedRecordIds, excludedRecordIds } = contextStoreTargetedRecords;

  // Determine if we should skip the query based on the following conditions:
  // 1. We're not selecting all records (selectedRecordIds !== 'all')
  // 2. Either:
  //    a) No specific records are selected (selectedRecordIds.length === 0)
  //    b) We're only requesting the 'id' field (which we already have)
  const isOnlyRequestingId =
    Object.keys(recordGqlFields ?? {}).length === 1 &&
    recordGqlFields?.id === true;

  const skip =
    selectedRecordIds !== 'all' &&
    (selectedRecordIds.length === 0 || isOnlyRequestingId);

  const filter = getFilterForSelectedRecords(
    selectedRecordIds,
    excludedRecordIds,
    queryFilter,
  );

  const findManyRecordsParams = useFindManyParams(
    objectMetadataItem?.nameSingular ?? '',
    objectMetadataItem?.namePlural ?? '',
  );

  const result = useFindManyRecords({
    ...findManyRecordsParams,
    recordGqlFields,
    filter,
    limit,
    skip,
  });

  const { fetchAllRecordIds } = useFetchAllRecordIds({
    objectNameSingular: objectMetadataItem?.nameSingular ?? '',
    filter,
    limit,
  });

  return {
    ...result,
    totalCount: skip ? selectedRecordIds.length : result.totalCount,
    records: skip ? selectedRecordIds.map((id) => ({ id })) : result.records,
    fetchAllRecordIds,
  };
};
