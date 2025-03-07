import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useSetRecordIdsForColumn } from '@/object-record/record-board/hooks/useSetRecordIdsForColumn';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { computeRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { useRecordBoardRecordGqlFields } from '@/object-record/record-index/hooks/useRecordBoardRecordGqlFields';
import { useSetRecordIndexEntityCount } from '@/object-record/record-index/hooks/useSetRecordIndexEntityCount';
import { recordIndexViewFilterGroupsState } from '@/object-record/record-index/states/recordIndexViewFilterGroupsState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { isDefined } from 'twenty-shared';

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

  const recordFilterGroups = mapViewFilterGroupsToRecordFilterGroups(
    recordIndexViewFilterGroups,
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const currentRecordSorts = useRecoilComponentValueV2(
    currentRecordSortsComponentState,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const requestFilters = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: currentRecordFilters,
    recordFilterGroups,
    fields: objectMetadataItem.fields,
  });

  const orderBy = turnSortsIntoOrderBy(objectMetadataItem, currentRecordSorts);

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
    totalCount,
  } = useFindManyRecords({
    objectNameSingular,
    filter,
    orderBy,
    recordGqlFields,
    limit: 10,
  });

  const { setRecordIndexEntityCount } =
    useSetRecordIndexEntityCount(recordBoardId);

  useEffect(() => {
    setRecordIndexEntityCount(totalCount ?? 0, columnId);
  }, [setRecordIndexEntityCount, totalCount, columnId]);

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
