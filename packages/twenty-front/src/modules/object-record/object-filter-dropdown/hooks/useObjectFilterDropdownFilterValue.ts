import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';

export const useObjectFilterDropdownFilterValue = () => {
  const currentRecordFilter = useAtomComponentValue(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const objectFilterDropdownFilterValue = currentRecordFilter?.value;

  return { objectFilterDropdownFilterValue };
};
