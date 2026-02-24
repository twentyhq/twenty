import { useCallback } from 'react';
import { useStore } from 'jotai';

import { activeRecordTableRowIndexComponentState } from '@/object-record/record-table/states/activeRecordTableRowIndexComponentState';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { isDefined } from 'twenty-shared/utils';

export const useActiveRecordTableRow = (recordTableId?: string) => {
  const isRowActiveState = useRecoilComponentFamilyStateCallbackStateV2(
    isRecordTableRowActiveComponentFamilyState,
    recordTableId,
  );

  const activeRowIndexState = useRecoilComponentStateCallbackStateV2(
    activeRecordTableRowIndexComponentState,
    recordTableId,
  );

  const store = useStore();

  const deactivateRecordTableRow = useCallback(() => {
    const activeRowIndex = store.get(activeRowIndexState);

    if (!isDefined(activeRowIndex)) {
      return;
    }

    store.set(activeRowIndexState, null);

    store.set(isRowActiveState(activeRowIndex), false);
  }, [activeRowIndexState, isRowActiveState, store]);

  const activateRecordTableRow = useCallback(
    (rowIndex: number) => {
      const activeRowIndex = store.get(activeRowIndexState);

      if (activeRowIndex === rowIndex) {
        return;
      }

      if (isDefined(activeRowIndex)) {
        store.set(isRowActiveState(activeRowIndex), false);
      }

      store.set(activeRowIndexState, rowIndex);

      store.set(isRowActiveState(rowIndex), true);
    },
    [activeRowIndexState, isRowActiveState, store],
  );

  return {
    activateRecordTableRow,
    deactivateRecordTableRow,
  };
};
