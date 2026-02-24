import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';

export const useSetHasUserSelectedAllRows = (recordTableId?: string) => {
  const hasUserSelectedAllRowsAtom = useRecoilComponentStateCallbackStateV2(
    hasUserSelectedAllRowsComponentState,
    recordTableId,
  );

  const store = useStore();

  return (selected: boolean) => {
    store.set(hasUserSelectedAllRowsAtom, selected);
  };
};
