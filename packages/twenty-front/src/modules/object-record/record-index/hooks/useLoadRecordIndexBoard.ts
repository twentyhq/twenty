import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useRecordBoard } from '@/object-record/record-board/hooks/useRecordBoard';
import { turnObjectDropdownFilterIntoQueryFilter } from '@/object-record/record-filter/utils/turnObjectDropdownFilterIntoQueryFilter';
import { useRecordBoardRecordGqlFields } from '@/object-record/record-index/hooks/useRecordBoardRecordGqlFields';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { recordIndexIsCompactModeActiveState } from '@/object-record/record-index/states/recordIndexIsCompactModeActiveState';
import { recordIndexSortsState } from '@/object-record/record-index/states/recordIndexSortsState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useSetRecordCountInCurrentView } from '@/views/hooks/useSetRecordCountInCurrentView';

type UseLoadRecordIndexBoardProps = {
  objectNameSingular: string;
  viewBarId: string;
  recordBoardId: string;
};

export const useLoadRecordIndexBoard = ({
  objectNameSingular,
  viewBarId,
  recordBoardId,
}: UseLoadRecordIndexBoardProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const {
    setRecordIds: setRecordIdsInBoard,
    setFieldDefinitions,
    isCompactModeActiveState,
  } = useRecordBoard(recordBoardId);
  const { upsertRecords: upsertRecordsInStore } = useUpsertRecordsInStore();

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
  const orderBy = turnSortsIntoOrderBy(objectMetadataItem, recordIndexSorts);

  const recordIndexIsCompactModeActive = useRecoilValue(
    recordIndexIsCompactModeActiveState,
  );

  const recordGqlFields = useRecordBoardRecordGqlFields({
    objectMetadataItem,
    recordBoardId,
  });

  const {
    records,
    totalCount,
    loading,
    fetchMoreRecords,
    queryStateIdentifier,
  } = useFindManyRecords({
    objectNameSingular,
    filter: requestFilters,
    orderBy,
    recordGqlFields,
  });

  const { setRecordCountInCurrentView } =
    useSetRecordCountInCurrentView(viewBarId);

  const setIsCompactModeActive = useSetRecoilState(isCompactModeActiveState);

  useEffect(() => {
    setRecordIdsInBoard(records);
  }, [records, setRecordIdsInBoard]);

  useEffect(() => {
    upsertRecordsInStore(records);
  }, [records, upsertRecordsInStore]);

  useEffect(() => {
    setRecordCountInCurrentView(totalCount);
  }, [totalCount, setRecordCountInCurrentView]);

  useEffect(() => {
    setIsCompactModeActive(recordIndexIsCompactModeActive);
  }, [recordIndexIsCompactModeActive, setIsCompactModeActive]);

  return {
    records,
    loading,
    fetchMoreRecords,
    queryStateIdentifier,
  };
};
