import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useRecordBoard } from '@/object-record/record-board/hooks/useRecordBoard';
import { turnObjectDropdownFilterIntoQueryFilter } from '@/object-record/record-filter/utils/turnObjectDropdownFilterIntoQueryFilter';
import { useRecordBoardRecordGqlFields } from '@/object-record/record-index/hooks/useRecordBoardRecordGqlFields';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { recordIndexSortsState } from '@/object-record/record-index/states/recordIndexSortsState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { isDefined } from '~/utils/isDefined';

type UseLoadRecordIndexBoardProps = {
  objectNameSingular: string;
  boardFieldMetadataId: string | null;
  recordBoardId: string;
  columnFieldSelectValue: string | null;
  columnId: string;
};

export const useLoadRecordIndexBoardColumn = ({
  objectNameSingular,
  boardFieldMetadataId,
  recordBoardId,
  columnFieldSelectValue,
  columnId,
}: UseLoadRecordIndexBoardProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { setRecordIdsForColumn } = useRecordBoard(recordBoardId);
  const { upsertRecords: upsertRecordsInStore } = useUpsertRecordsInStore();

  const recordIndexFilters = useRecoilValue(recordIndexFiltersState);
  const recordIndexSorts = useRecoilValue(recordIndexSortsState);
  const requestFilters = turnObjectDropdownFilterIntoQueryFilter(
    recordIndexFilters,
    objectMetadataItem?.fields ?? [],
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
      columnFieldSelectValue,
    )
      ? { in: [columnFieldSelectValue] }
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
