import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';

export const useUpsertObjectFilterDropdownCurrentFilter = () => {
  const objectFilterDropdownCurrentRecordFilterCallbackState =
    useRecoilComponentCallbackStateV2(
      objectFilterDropdownCurrentRecordFilterComponentState,
    );

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const upsertObjectFilterDropdownCurrentFilter = useRecoilCallback(
    ({ set }) =>
      (recordFilterToUpsert: RecordFilter) => {
        upsertRecordFilter(recordFilterToUpsert);

        set(
          objectFilterDropdownCurrentRecordFilterCallbackState,
          recordFilterToUpsert,
        );
      },
    [objectFilterDropdownCurrentRecordFilterCallbackState, upsertRecordFilter],
  );

  return {
    upsertObjectFilterDropdownCurrentFilter,
  };
};
