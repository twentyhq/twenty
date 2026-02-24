import { objectSortDropdownSearchInputComponentState } from '@/object-record/object-sort-dropdown/states/objectSortDropdownSearchInputComponentState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useResetRecordSortDropdownSearchInput = () => {
  const objectSortDropdownSearchInputCallbackState =
    useRecoilComponentStateCallbackStateV2(
      objectSortDropdownSearchInputComponentState,
    );

  const store = useStore();

  const resetRecordSortDropdownSearchInput = useCallback(() => {
    store.set(objectSortDropdownSearchInputCallbackState, '');
  }, [objectSortDropdownSearchInputCallbackState, store]);

  return {
    resetRecordSortDropdownSearchInput,
  };
};
