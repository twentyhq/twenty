import { useCallback } from 'react';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { allRowsSelectedStatusComponentSelector } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusComponentSelector';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useStore } from 'jotai';

export const useSelectAllRows = (recordTableId?: string) => {
  const hasUserSelectedAllRows = useAtomComponentStateCallbackState(
    hasUserSelectedAllRowsComponentState,
    recordTableId,
  );

  const allRowsSelectedStatus = useAtomComponentSelectorCallbackState(
    allRowsSelectedStatusComponentSelector,
    recordTableId,
  );

  const isRowSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );

  const recordIndexAllRecordIds = useAtomComponentSelectorCallbackState(
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
