import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useRecordBoard } from '@/object-record/record-board/hooks/useRecordBoard';
import { turnObjectDropdownFilterIntoQueryFilter } from '@/object-record/record-filter/utils/turnObjectDropdownFilterIntoQueryFilter';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { recordIndexSortsState } from '@/object-record/record-index/states/recordIndexSortsState';
import { useSetRecordInStore } from '@/object-record/record-store/hooks/useSetRecordInStore';

export const useLoadRecordIndexBoard = (
  objectNameSingular: string,
  recordBoardId: string,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { setRecordIds: setRecordIdsInBoard, setFieldDefinitions } =
    useRecordBoard(recordBoardId);
  const { setRecords: setRecordsInStore } = useSetRecordInStore();

  const recordIndexFieldDefinitions = useRecoilValue(
    recordIndexFieldDefinitionsState,
  );
  useEffect(() => {
    setFieldDefinitions(recordIndexFieldDefinitions);
  }, [recordIndexFieldDefinitions, setFieldDefinitions]);

  const recordIndexFilters = useRecoilValue(recordIndexFiltersState);
  const recordIndexSorts = useRecoilValue(recordIndexSortsState);
  const requestFilters = turnObjectDropdownFilterIntoQueryFilter(
    recordIndexFilters,
    objectMetadataItem?.fields ?? [],
  );
  const orderBy = turnSortsIntoOrderBy(
    recordIndexSorts,
    objectMetadataItem?.fields ?? [],
  );

  const { records, loading, fetchMoreRecords, queryStateIdentifier } =
    useFindManyRecords({
      objectNameSingular,
      filter: requestFilters,
      orderBy,
    });

  useEffect(() => {
    setRecordIdsInBoard(records);
  }, [records, setRecordIdsInBoard]);

  useEffect(() => {
    setRecordsInStore(records);
  }, [records, setRecordsInStore]);

  return {
    records,
    loading,
    fetchMoreRecords,
    queryStateIdentifier,
  };
};
