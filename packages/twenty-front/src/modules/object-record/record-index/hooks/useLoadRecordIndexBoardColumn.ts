import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useSetRecordIdsForColumn } from '@/object-record/record-board/hooks/useSetRecordIdsForColumn';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { computeRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { useRecordBoardRecordGqlFields } from '@/object-record/record-index/hooks/useRecordBoardRecordGqlFields';

import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
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

  const currentRecordFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
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
    recordFilterGroups: currentRecordFilterGroups,
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
