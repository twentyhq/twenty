import { useCallback } from 'react';

import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';

export const useUpsertObjectFilterDropdownCurrentFilter = () => {
  const store = useStore();
  const objectFilterDropdownCurrentRecordFilter =
    useAtomComponentStateCallbackState(
      objectFilterDropdownCurrentRecordFilterComponentState,
    );

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const upsertObjectFilterDropdownCurrentFilter = useCallback(
    (recordFilterToUpsert: RecordFilter) => {
      upsertRecordFilter(recordFilterToUpsert);

      store.set(objectFilterDropdownCurrentRecordFilter, recordFilterToUpsert);
    },
    [objectFilterDropdownCurrentRecordFilter, upsertRecordFilter, store],
  );

  return {
    upsertObjectFilterDropdownCurrentFilter,
  };
};
