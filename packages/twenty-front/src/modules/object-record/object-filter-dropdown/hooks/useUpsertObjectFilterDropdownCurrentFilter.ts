import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const useUpsertObjectFilterDropdownCurrentFilter = () => {
  const setObjectFilterDropdownCurrentRecordFilter =
    useSetRecoilComponentStateV2(
      objectFilterDropdownCurrentRecordFilterComponentState,
    );

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const upsertObjectFilterDropdownCurrentFilter = (
    recordFilterToUpsert: RecordFilter,
  ) => {
    upsertRecordFilter(recordFilterToUpsert);

    setObjectFilterDropdownCurrentRecordFilter(recordFilterToUpsert);
  };

  return {
    upsertObjectFilterDropdownCurrentFilter,
  };
};
