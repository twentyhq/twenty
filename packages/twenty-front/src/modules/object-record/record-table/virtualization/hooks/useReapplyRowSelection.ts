import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useSelectAllRows } from '@/object-record/record-table/hooks/internal/useSelectAllRows';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useReapplyRowSelection = () => {
  const { selectAllRows } = useSelectAllRows();

  const hasUserSelectedAllRowsAtom = useAtomComponentStateCallbackState(
    hasUserSelectedAllRowsComponentState,
  );

  const store = useStore();

  const reapplyRowSelection = useCallback(() => {
    if (store.get(hasUserSelectedAllRowsAtom)) {
      selectAllRows();
    }
  }, [store, hasUserSelectedAllRowsAtom, selectAllRows]);

  return {
    reapplyRowSelection,
  };
};
