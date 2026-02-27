import { useCallback } from 'react';

import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';

export const useEmptyRecordFilter = (componentInstanceId?: string) => {
  const store = useStore();
  const objectFilterDropdownSearchInput = useAtomComponentStateCallbackState(
    objectFilterDropdownSearchInputComponentState,
    componentInstanceId,
  );

  const objectFilterDropdownCurrentRecordFilter =
    useAtomComponentStateCallbackState(
      objectFilterDropdownCurrentRecordFilterComponentState,
      componentInstanceId,
    );

  const emptyRecordFilter = useCallback(() => {
    store.set(objectFilterDropdownSearchInput, '');
    store.set(objectFilterDropdownCurrentRecordFilter, undefined);
  }, [
    objectFilterDropdownSearchInput,
    objectFilterDropdownCurrentRecordFilter,
    store,
  ]);

  return {
    emptyRecordFilter,
  };
};
