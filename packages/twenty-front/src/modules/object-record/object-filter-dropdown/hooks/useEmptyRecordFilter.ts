import { useCallback } from 'react';

import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';

export const useEmptyRecordFilter = (componentInstanceId?: string) => {
  const objectFilterDropdownSearchInputAtom =
    useRecoilComponentStateCallbackStateV2(
      objectFilterDropdownSearchInputComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownCurrentRecordFilterAtom =
    useRecoilComponentStateCallbackStateV2(
      objectFilterDropdownCurrentRecordFilterComponentState,
      componentInstanceId,
    );

  const emptyRecordFilter = useCallback(() => {
    jotaiStore.set(objectFilterDropdownSearchInputAtom, '');
    jotaiStore.set(objectFilterDropdownCurrentRecordFilterAtom, undefined);
  }, [
    objectFilterDropdownSearchInputAtom,
    objectFilterDropdownCurrentRecordFilterAtom,
  ]);

  return {
    emptyRecordFilter,
  };
};
