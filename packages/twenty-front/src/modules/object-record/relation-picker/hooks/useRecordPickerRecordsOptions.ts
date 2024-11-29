import { recordPickerSearchFilterComponentState } from '@/object-record/relation-picker/states/recordPickerSearchFilterComponentState';
import { useFilteredSearchRecordQuery } from '@/search/hooks/useFilteredSearchRecordQuery';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useRecordPickerRecordsOptions = ({
  objectNameSingular,
  selectedRecordIds = [],
  excludedRecordIds = [],
}: {
  objectNameSingular: string;
  selectedRecordIds?: string[];
  excludedRecordIds?: string[];
}) => {
  const recordPickerSearchFilter = useRecoilComponentValueV2(
    recordPickerSearchFilterComponentState,
  );

  const records = useFilteredSearchRecordQuery({
    searchFilter: recordPickerSearchFilter,
    selectedIds: selectedRecordIds,
    excludedRecordIds: excludedRecordIds,
    objectNameSingular,
  });

  return { records, recordPickerSearchFilter };
};
