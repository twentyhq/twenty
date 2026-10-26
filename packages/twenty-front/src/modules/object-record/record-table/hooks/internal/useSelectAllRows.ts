import { isTotalNumberOfRowsKnownComponentState } from '@/object-record/record-table/virtualization/states/isTotalNumberOfRowsKnownComponentState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useSelectAllRecords } from '@/object-record/record-selection/hooks/useSelectAllRecords';
import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useSelectAllRows = (recordTableId?: string) => {
  const { selectAllRecords } = useSelectAllRecords(recordTableId);

  const hasUserSelectedAllRecords = useAtomComponentStateCallbackState(
    hasUserSelectedAllRecordsComponentState,
    recordTableId,
  );

  const store = useStore();
  const isTotalNumberOfRowsKnownCallbackState =
    useAtomComponentStateCallbackState(
      isTotalNumberOfRowsKnownComponentState,
      recordTableId,
    );

  const selectAllRows = useCallback(() => {
    if (selectAllRecords()) {
      store.set(
        hasUserSelectedAllRecords,
        store.get(isTotalNumberOfRowsKnownCallbackState),
      );
    }
  }, [
    selectAllRecords,
    hasUserSelectedAllRecords,
    store,
    isTotalNumberOfRowsKnownCallbackState,
  ]);

  return {
    selectAllRows,
  };
};
