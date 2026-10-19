import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { recordTableRowIndexOfRecordComponentFamilySelector } from '@/object-record/record-table/states/selectors/recordTableRowIndexOfRecordComponentFamilySelector';
import { useAtomComponentFamilySelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorCallbackState';

export const useGetRecordTableRowIndex = () => {
  const store = useStore();
  const { recordId } = useRecordTableRowContextOrThrow();

  const rowIndexOfRecordCallbackState =
    useAtomComponentFamilySelectorCallbackState(
      recordTableRowIndexOfRecordComponentFamilySelector,
    );

  const getRecordTableRowIndex = useCallback(
    () => store.get(rowIndexOfRecordCallbackState(recordId)),
    [recordId, rowIndexOfRecordCallbackState, store],
  );

  return { getRecordTableRowIndex };
};
