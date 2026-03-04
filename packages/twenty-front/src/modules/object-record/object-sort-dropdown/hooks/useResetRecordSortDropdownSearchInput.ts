import { objectSortDropdownSearchInputComponentState } from '@/object-record/object-sort-dropdown/states/objectSortDropdownSearchInputComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useResetRecordSortDropdownSearchInput = () => {
  const objectSortDropdownSearchInputCallbackState =
    useAtomComponentStateCallbackState(
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
