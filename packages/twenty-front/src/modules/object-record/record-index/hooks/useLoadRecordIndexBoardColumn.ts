import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useRecordBoard } from '@/object-record/record-board/hooks/useRecordBoard';
import { turnFiltersIntoQueryFilter } from '@/object-record/record-filter/utils/turnFiltersIntoQueryFilter';
import { useRecordBoardRecordGqlFields } from '@/object-record/record-index/hooks/useRecordBoardRecordGqlFields';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { recordIndexSortsState } from '@/object-record/record-index/states/recordIndexSortsState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { isDefined } from '~/utils/isDefined';
import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';

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
  const { setRecordIdsForColumn } = useRecordBoard(recordBoardId);
  const { columnsFamilySelector } = useRecordBoardStates(recordBoardId);
  const { upsertRecords: upsertRecordsInStore } = useUpsertRecordsInStore();

  const recordIndexFilters = useRecoilValue(recordIndexFiltersState);
  const recordIndexSorts = useRecoilValue(recordIndexSortsState);
  const columnDefinition = useRecoilValue(columnsFamilySelector(columnId));
  const requestFilters = turnFiltersIntoQueryFilter(
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
      columnDefinition?.value,
    )
      ? { in: [columnDefinition?.value] }
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
