import { useCallback } from 'react';

import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';

export const useEmptyRecordFilter = (componentInstanceId?: string) => {
  const store = useStore();
  const objectFilterDropdownSearchInput =
    useRecoilComponentStateCallbackStateV2(
      objectFilterDropdownSearchInputComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownCurrentRecordFilter =
    useRecoilComponentStateCallbackStateV2(
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
