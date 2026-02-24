import { useCallback } from 'react';

import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';

export const useUpsertObjectFilterDropdownCurrentFilter = () => {
  const store = useStore();
  const objectFilterDropdownCurrentRecordFilter =
    useRecoilComponentStateCallbackStateV2(
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
