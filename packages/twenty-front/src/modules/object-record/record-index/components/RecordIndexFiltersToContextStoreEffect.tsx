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
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

export const RecordIndexFiltersToContextStoreEffect = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const recordIndexFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
    recordIndexId,
  );

  const recordIndexFilterGroups = useRecoilComponentValue(
    currentRecordFilterGroupsComponentState,
    recordIndexId,
  );

  const setContextStoreTargetedRecords = useSetRecoilComponentState(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const hasUserSelectedAllRows = useRecoilComponentValue(
    hasUserSelectedAllRowsComponentState,
    recordIndexId,
  );

  const selectedRowIds = useRecoilComponentValue(
    selectedRowIdsComponentSelector,
    recordIndexId,
  );
  const unselectedRowIds = useRecoilComponentValue(
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

  const setContextStoreFilters = useSetRecoilComponentState(
    contextStoreFiltersComponentState,
  );

  const setContextStoreFilterGroups = useSetRecoilComponentState(
    contextStoreFilterGroupsComponentState,
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

  const setContextStoreAnyFieldFilterValue = useSetRecoilComponentState(
    contextStoreAnyFieldFilterValueComponentState,
  );

  const anyFieldFilterValue = useRecoilComponentValue(
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
