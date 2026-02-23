import { useRecoilCallback } from 'recoil';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { allRowsSelectedStatusComponentSelector } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusComponentSelector';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useStore } from 'jotai';

export const useSelectAllRows = (recordTableId?: string) => {
  const hasUserSelectedAllRowsCallbackState = useRecoilComponentCallbackState(
    hasUserSelectedAllRowsComponentState,
    recordTableId,
  );

  const allRowsSelectedStatusAtom = useRecoilComponentSelectorCallbackStateV2(
    allRowsSelectedStatusComponentSelector,
    recordTableId,
  );

  const isRowSelectedFamilyState = useRecoilComponentFamilyStateCallbackStateV2(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );

  const recordIndexAllRecordIdsAtom = useRecoilComponentSelectorCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const { resetTableRowSelection } = useResetTableRowSelection(recordTableId);

  const store = useStore();

  const selectAllRows = useRecoilCallback(
    ({ set }) =>
      () => {
        const allRowsSelectedStatus = store.get(allRowsSelectedStatusAtom);
        const allRecordIds = store.get(recordIndexAllRecordIdsAtom);

        if (allRowsSelectedStatus === 'all') {
          resetTableRowSelection();
        }

        for (const recordId of allRecordIds) {
          const isSelected =
            allRowsSelectedStatus === 'none' ||
            allRowsSelectedStatus === 'some';

          store.set(isRowSelectedFamilyState(recordId), isSelected);
        }

        set(hasUserSelectedAllRowsCallbackState, true);
      },
    [
      allRowsSelectedStatusAtom,
      recordIndexAllRecordIdsAtom,
      resetTableRowSelection,
      isRowSelectedFamilyState,
      hasUserSelectedAllRowsCallbackState,
      store,
    ],
  );

  return {
    selectAllRows,
  };
};
