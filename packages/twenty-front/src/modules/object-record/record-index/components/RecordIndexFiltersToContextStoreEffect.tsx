import { useEffect } from 'react';

import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { unselectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/unselectedRowIdsComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useRecoilValue } from 'recoil';

export const RecordIndexFiltersToContextStoreEffect = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const recordIndexFilters = useRecoilValue(recordIndexFiltersState);

  const setContextStoreTargetedRecords = useSetRecoilComponentStateV2(
    contextStoreTargetedRecordsRuleComponentState,
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
  );

  useEffect(() => {
    setContextStoreFilters(recordIndexFilters);

    return () => {
      setContextStoreFilters([]);
    };
  }, [recordIndexFilters, setContextStoreFilters]);

  return <></>;
};
