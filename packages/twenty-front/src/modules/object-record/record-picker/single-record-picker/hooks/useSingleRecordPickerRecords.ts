import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { useFilteredSearchRecordQuery } from '@/search/hooks/useFilteredSearchRecordQuery';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useSingleRecordPickerRecords = ({
  objectNameSingular,
  selectedRecordIds = [],
  excludedRecordIds = [],
}: {
  objectNameSingular: string;
  selectedRecordIds?: string[];
  excludedRecordIds?: string[];
}) => {
  const recordPickerSearchFilter = useRecoilComponentValueV2(
    singleRecordPickerSearchFilterComponentState,
  );

  const records = useFilteredSearchRecordQuery({
    searchFilter: recordPickerSearchFilter,
    selectedIds: selectedRecordIds,
    excludedRecordIds: excludedRecordIds,
    objectNameSingular,
  });

  return { records };
};
