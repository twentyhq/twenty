import { useContext, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { contextStoreTargetedRecordsState } from '@/context-store/states/contextStoreTargetedRecordsState';
import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { useHandleToggleColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleColumnFilter';
import { useHandleToggleColumnSort } from '@/object-record/record-index/hooks/useHandleToggleColumnSort';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { useSetRecordCountInCurrentView } from '@/views/hooks/useSetRecordCountInCurrentView';

export const RecordIndexTableContainerEffect = () => {
  const { recordIndexId, objectNameSingular } = useContext(
    RecordIndexRootPropsContext,
  );

  const viewBarId = recordIndexId;

  const {
    setAvailableTableColumns,
    setOnEntityCountChange,
    selectedRowIdsSelector,
    setOnToggleColumnFilter,
    setOnToggleColumnSort,
    hasUserSelectedAllRowsState,
    unselectedRowIdsSelector,
  } = useRecordTable({
    recordTableId: recordIndexId,
  });

  const setContextStoreTargetedRecords = useSetRecoilState(
    contextStoreTargetedRecordsState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const { setRecordCountInCurrentView } =
    useSetRecordCountInCurrentView(viewBarId);

  useEffect(() => {
    setAvailableTableColumns(columnDefinitions);
  }, [columnDefinitions, setAvailableTableColumns]);

  const selectedRowIds = useRecoilValue(selectedRowIdsSelector());

  const handleToggleColumnFilter = useHandleToggleColumnFilter({
    objectNameSingular,
    viewBarId,
  });

  const handleToggleColumnSort = useHandleToggleColumnSort({
    objectNameSingular,
    viewBarId,
  });

  useEffect(() => {
    setOnToggleColumnFilter(
      () => (fieldMetadataId: string) =>
        handleToggleColumnFilter(fieldMetadataId),
    );
  }, [setOnToggleColumnFilter, handleToggleColumnFilter]);

  useEffect(() => {
    setOnToggleColumnSort(
      () => (fieldMetadataId: string) =>
        handleToggleColumnSort(fieldMetadataId),
    );
  }, [setOnToggleColumnSort, handleToggleColumnSort]);

  useEffect(() => {
    setOnEntityCountChange(
      () => (entityCount: number) => setRecordCountInCurrentView(entityCount),
    );
  }, [setRecordCountInCurrentView, setOnEntityCountChange]);

  const hasUserSelectedAllRows = useRecoilValue(hasUserSelectedAllRowsState);
  const unselectedRowIds = useRecoilValue(unselectedRowIdsSelector());

  useEffect(() => {
    setContextStoreTargetedRecords({
      selectedRecordIds:
        selectedRowIds.length !== 1 && hasUserSelectedAllRows
          ? 'all'
          : selectedRowIds,
      excludedRecordIds: unselectedRowIds,
    });

    return () => {
      setContextStoreTargetedRecords({
        selectedRecordIds: [],
        excludedRecordIds: [],
      });
    };
  }, [
    hasUserSelectedAllRows,
    selectedRowIds,
    setContextStoreTargetedRecords,
    unselectedRowIds,
  ]);

  return <></>;
};
