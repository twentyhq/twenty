import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useSelectAllRows } from '@/object-record/record-table/hooks/internal/useSelectAllRows';
import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useReapplyRowSelection = () => {
  const { selectAllRows } = useSelectAllRows();

  const hasUserSelectedAllRecordsAtom = useAtomComponentStateCallbackState(
    hasUserSelectedAllRecordsComponentState,
  );

  const store = useStore();

  const reapplyRowSelection = useCallback(() => {
    if (store.get(hasUserSelectedAllRecordsAtom)) {
      selectAllRows();
    }
  }, [store, hasUserSelectedAllRecordsAtom, selectAllRows]);

  return {
    reapplyRowSelection,
  };
};
