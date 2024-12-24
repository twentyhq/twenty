import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useSetRecordIdsForColumn } from '@/object-record/record-board/hooks/useSetRecordIdsForColumn';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { computeViewRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { useRecordBoardRecordGqlFields } from '@/object-record/record-index/hooks/useRecordBoardRecordGqlFields';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { recordIndexSortsState } from '@/object-record/record-index/states/recordIndexSortsState';
import { recordIndexViewFilterGroupsState } from '@/object-record/record-index/states/recordIndexViewFilterGroupsState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { isDefined } from '~/utils/isDefined';

type UseLoadRecordIndexBoardProps = {
  objectNameSingular: string;
  boardFieldMetadataId: string | null;
  recordBoardId: string;
  columnId: string;
};

export const useLoadRecordIndexBoardColumn = ({
  objectNameSingular,
  boardFieldMetadataId,
  recordBoardId,
  columnId,
}: UseLoadRecordIndexBoardProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { setRecordIdsForColumn } = useSetRecordIdsForColumn(recordBoardId);
  const { upsertRecords: upsertRecordsInStore } = useUpsertRecordsInStore();

  const recordGroupDefinition = useRecoilValue(
    recordGroupDefinitionFamilyState(columnId),
  );

  const recordIndexViewFilterGroups = useRecoilValue(
    recordIndexViewFilterGroupsState,
  );
  const recordIndexFilters = useRecoilValue(recordIndexFiltersState);
  const recordIndexSorts = useRecoilValue(recordIndexSortsState);

  const { filterValueDependencies } = useFilterValueDependencies();

  const requestFilters = computeViewRecordGqlOperationFilter(
    filterValueDependencies,
    recordIndexFilters,
    objectMetadataItem?.fields ?? [],
    recordIndexViewFilterGroups,
  );
  const orderBy = turnSortsIntoOrderBy(objectMetadataItem, recordIndexSorts);

  const recordGqlFields = useRecordBoardRecordGqlFields({
    objectMetadataItem,
    recordBoardId,
  });

  const recordIndexKanbanFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === boardFieldMetadataId,
  );

  const filter = {
    ...requestFilters,
    [recordIndexKanbanFieldMetadataItem?.name ?? '']: isDefined(
      recordGroupDefinition?.value,
    )
      ? { in: [recordGroupDefinition?.value] }
      : { is: 'NULL' },
  };

  const {
    records,
    loading,
    fetchMoreRecords,
    queryStateIdentifier,
    hasNextPage,
  } = useFindManyRecords({
    objectNameSingular,
    filter,
    orderBy,
    recordGqlFields,
    limit: 10,
  });

  useEffect(() => {
    setRecordIdsForColumn(columnId, records);
  }, [records, setRecordIdsForColumn, columnId]);

  useEffect(() => {
    upsertRecordsInStore(records);
  }, [records, upsertRecordsInStore]);

  return {
    records,
    loading,
    fetchMoreRecords,
    queryStateIdentifier,
    hasNextPage,
  };
};
