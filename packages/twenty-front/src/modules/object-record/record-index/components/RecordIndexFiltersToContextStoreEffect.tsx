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
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';

export const RecordIndexFiltersToContextStoreEffect = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const recordIndexFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
    recordIndexId,
  );

  const recordIndexFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
    recordIndexId,
  );

  const setContextStoreTargetedRecords = useSetRecoilComponentStateV2(
    contextStoreTargetedRecordsRuleComponentState,
    recordIndexId,
  );

  const hasUserSelectedAllRows = useRecoilComponentValueV2(
    hasUserSelectedAllRowsComponentState,
    recordIndexId,
  );

  const selectedRowIds = useRecoilComponentSelectorValueV2(
    selectedRowIdsComponentSelector,
    recordIndexId,
  );
  const unselectedRowIds = useRecoilComponentSelectorValueV2(
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

  const setContextStoreFilters = useSetRecoilComponentStateV2(
    contextStoreFiltersComponentState,
    recordIndexId,
  );

  const setContextStoreFilterGroups = useSetRecoilComponentStateV2(
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

  const setContextStoreAnyFieldFilterValue = useSetRecoilComponentStateV2(
    contextStoreAnyFieldFilterValueComponentState,
    recordIndexId,
  );

  const anyFieldFilterValue = useRecoilComponentValueV2(
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
