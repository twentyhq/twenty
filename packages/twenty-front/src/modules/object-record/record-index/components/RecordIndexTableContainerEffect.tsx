import { useContext, useEffect } from 'react';

import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { useHandleToggleColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleColumnFilter';
import { useHandleToggleColumnSort } from '@/object-record/record-index/hooks/useHandleToggleColumnSort';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { unselectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/unselectedRowIdsComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useSetRecordCountInCurrentView } from '@/views/hooks/useSetRecordCountInCurrentView';

export const RecordIndexTableContainerEffect = () => {
  const { recordIndexId, objectNameSingular } = useContext(
    RecordIndexRootPropsContext,
  );

  const viewBarId = recordIndexId;

  const {
    setAvailableTableColumns,
    setOnEntityCountChange,
    setOnToggleColumnFilter,
    setOnToggleColumnSort,
  } = useRecordTable({
    recordTableId: recordIndexId,
  });

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

  const setContextStoreTargetedRecords = useSetRecoilComponentStateV2(
    contextStoreTargetedRecordsRuleComponentState,
    recordIndexId,
  );
  const hasUserSelectedAllRows = useRecoilComponentValueV2(
    hasUserSelectedAllRowsComponentState,
    recordIndexId,
  );
  const selectedRowIds = useRecoilComponentValueV2(
    selectedRowIdsComponentSelector,
    recordIndexId,
  );
  const unselectedRowIds = useRecoilComponentValueV2(
    unselectedRowIdsComponentSelector,
    recordIndexId,
  );

  useEffect(() => {
    if (hasUserSelectedAllRows) {
      setContextStoreTargetedRecords({
        mode: 'exclusion',
        excludedRecordIds: unselectedRowIds,
        filters: [],
      });
    } else {
      setContextStoreTargetedRecords({
        mode: 'selection',
        selectedRecordIds: selectedRowIds,
      });
    }

    return () => {
      setContextStoreTargetedRecords({
        mode: 'selection',
        selectedRecordIds: [],
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
