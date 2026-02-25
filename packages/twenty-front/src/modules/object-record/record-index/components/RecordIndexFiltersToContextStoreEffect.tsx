import { useEffect } from 'react';

import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { unselectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/unselectedRowIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export const RecordIndexFiltersToContextStoreEffect = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const recordIndexFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
    recordIndexId,
  );

  const recordIndexFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
    recordIndexId,
  );

  const setContextStoreTargetedRecords = useSetAtomComponentState(
    contextStoreTargetedRecordsRuleComponentState,
    recordIndexId,
  );

  const hasUserSelectedAllRows = useAtomComponentStateValue(
    hasUserSelectedAllRowsComponentState,
    recordIndexId,
  );

  const selectedRowIds = useAtomComponentSelectorValue(
    selectedRowIdsComponentSelector,
    recordIndexId,
  );
  const unselectedRowIds = useAtomComponentSelectorValue(
    unselectedRowIdsComponentSelector,
    recordIndexId,
  );

  useEffect(() => {
    if (hasUserSelectedAllRows) {
      setContextStoreTargetedRecords({
        mode: 'exclusion',
        excludedRecordIds: unselectedRowIds,
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

  const setContextStoreFilters = useSetAtomComponentState(
    contextStoreFiltersComponentState,
    recordIndexId,
  );

  const setContextStoreFilterGroups = useSetAtomComponentState(
    contextStoreFilterGroupsComponentState,
    recordIndexId,
  );

  useEffect(() => {
    setContextStoreFilters(recordIndexFilters);
    setContextStoreFilterGroups(recordIndexFilterGroups);

    return () => {
      setContextStoreFilters([]);
    };
  }, [
    recordIndexFilterGroups,
    recordIndexFilters,
    setContextStoreFilterGroups,
    setContextStoreFilters,
  ]);

  const setContextStoreAnyFieldFilterValue = useSetAtomComponentState(
    contextStoreAnyFieldFilterValueComponentState,
    recordIndexId,
  );

  const anyFieldFilterValue = useAtomComponentStateValue(
    anyFieldFilterValueComponentState,
    recordIndexId,
  );

  useEffect(() => {
    setContextStoreAnyFieldFilterValue(anyFieldFilterValue);

    return () => {
      setContextStoreAnyFieldFilterValue('');
    };
  }, [anyFieldFilterValue, setContextStoreAnyFieldFilterValue]);

  return <></>;
};
