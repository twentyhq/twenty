import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';

export const useSetHasUserSelectedAllRows = (recordTableId?: string) => {
  const hasUserSelectedAllRows = useAtomComponentStateCallbackState(
    hasUserSelectedAllRowsComponentState,
    recordTableId,
  );

  const store = useStore();

  return (selected: boolean) => {
    store.set(hasUserSelectedAllRows, selected);
  };
};
