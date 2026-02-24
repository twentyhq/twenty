import { useCallback } from 'react';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { allRowsSelectedStatusComponentSelector } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusComponentSelector';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useStore } from 'jotai';

export const useSelectAllRows = (recordTableId?: string) => {
  const hasUserSelectedAllRows = useRecoilComponentStateCallbackStateV2(
    hasUserSelectedAllRowsComponentState,
    recordTableId,
  );

  const allRowsSelectedStatus = useRecoilComponentSelectorCallbackStateV2(
    allRowsSelectedStatusComponentSelector,
    recordTableId,
  );

  const isRowSelectedFamilyState = useRecoilComponentFamilyStateCallbackStateV2(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );

  const recordIndexAllRecordIds = useRecoilComponentSelectorCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const { resetTableRowSelection } = useResetTableRowSelection(recordTableId);

  const store = useStore();

  const selectAllRows = useCallback(() => {
    const currentAllRowsSelectedStatus = store.get(allRowsSelectedStatus);
    const allRecordIds = store.get(recordIndexAllRecordIds);

    if (currentAllRowsSelectedStatus === 'all') {
      resetTableRowSelection();
    }

    for (const recordId of allRecordIds) {
      const isSelected =
        currentAllRowsSelectedStatus === 'none' ||
        currentAllRowsSelectedStatus === 'some';

      store.set(isRowSelectedFamilyState(recordId), isSelected);
    }

    store.set(hasUserSelectedAllRows, true);
  }, [
    allRowsSelectedStatus,
    recordIndexAllRecordIds,
    resetTableRowSelection,
    isRowSelectedFamilyState,
    hasUserSelectedAllRows,
    store,
  ]);

  return {
    selectAllRows,
  };
};
