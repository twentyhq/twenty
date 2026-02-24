import { useCallback } from 'react';

import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';

export const useUpsertObjectFilterDropdownCurrentFilter = () => {
  const objectFilterDropdownCurrentRecordFilterAtom =
    useRecoilComponentStateCallbackStateV2(
      objectFilterDropdownCurrentRecordFilterComponentState,
    );

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const upsertObjectFilterDropdownCurrentFilter = useCallback(
    (recordFilterToUpsert: RecordFilter) => {
      upsertRecordFilter(recordFilterToUpsert);

      jotaiStore.set(
        objectFilterDropdownCurrentRecordFilterAtom,
        recordFilterToUpsert,
      );
    },
    [objectFilterDropdownCurrentRecordFilterAtom, upsertRecordFilter],
  );

  return {
    upsertObjectFilterDropdownCurrentFilter,
  };
};
