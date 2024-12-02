import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useSetRecordBoardRecordIds } from '@/object-record/record-board/hooks/useSetRecordBoardRecordIds';
import { isRecordBoardCompactModeActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCompactModeActiveComponentState';
import { recordBoardFieldDefinitionsComponentState } from '@/object-record/record-board/states/recordBoardFieldDefinitionsComponentState';
import { computeViewRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { useRecordBoardRecordGqlFields } from '@/object-record/record-index/hooks/useRecordBoardRecordGqlFields';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { recordIndexIsCompactModeActiveState } from '@/object-record/record-index/states/recordIndexIsCompactModeActiveState';
import { recordIndexSortsState } from '@/object-record/record-index/states/recordIndexSortsState';
import { recordIndexViewFilterGroupsState } from '@/object-record/record-index/states/recordIndexViewFilterGroupsState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
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

  const setRecordBoardFieldDefinitions = useSetRecoilComponentStateV2(
    recordBoardFieldDefinitionsComponentState,
    recordBoardId,
  );

  const { setRecordIds: setRecordIdsInBoard } =
    useSetRecordBoardRecordIds(recordBoardId);

  const { upsertRecords: upsertRecordsInStore } = useUpsertRecordsInStore();

  const recordIndexFieldDefinitions = useRecoilValue(
    recordIndexFieldDefinitionsState,
  );
  useEffect(() => {
    setRecordBoardFieldDefinitions(recordIndexFieldDefinitions);
  }, [recordIndexFieldDefinitions, setRecordBoardFieldDefinitions]);

  const recordIndexViewFilterGroups = useRecoilValue(
    recordIndexViewFilterGroupsState,
  );

  const recordIndexFilters = useRecoilValue(recordIndexFiltersState);
  const recordIndexSorts = useRecoilValue(recordIndexSortsState);
  const requestFilters = computeViewRecordGqlOperationFilter(
    recordIndexFilters,
    objectMetadataItem?.fields ?? [],
    recordIndexViewFilterGroups,
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

  const setIsCompactModeActive = useSetRecoilComponentStateV2(
    isRecordBoardCompactModeActiveComponentState,
    recordBoardId,
  );

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
