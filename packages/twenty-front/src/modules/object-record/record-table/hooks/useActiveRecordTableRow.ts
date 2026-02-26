import { useCallback } from 'react';
import { useStore } from 'jotai';

import { activeRecordTableRowIndexComponentState } from '@/object-record/record-table/states/activeRecordTableRowIndexComponentState';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { isDefined } from 'twenty-shared/utils';

export const useActiveRecordTableRow = (recordTableId?: string) => {
  const isRowActiveState = useAtomComponentFamilyStateCallbackState(
    isRecordTableRowActiveComponentFamilyState,
    recordTableId,
  );

  const activeRowIndexState = useAtomComponentStateCallbackState(
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
