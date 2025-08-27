import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { useFilteredSearchRecordQuery } from '@/search/hooks/useFilteredSearchRecordQuery';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const useSingleRecordPickerRecords = ({
  objectNameSingulars,
  excludedRecordIds = [],
}: {
  objectNameSingulars: string[];
  excludedRecordIds?: string[];
}) => {
  const recordPickerSearchFilter = useRecoilComponentValue(
    singleRecordPickerSearchFilterComponentState,
  );

  const selectedRecordId = useRecoilComponentValue(
    singleRecordPickerSelectedIdComponentState,
  );
  const records = useFilteredSearchRecordQuery({
    searchFilter: recordPickerSearchFilter,
    selectedIds: selectedRecordId ? [selectedRecordId] : [],
    excludedRecordIds: excludedRecordIds,
    objectNameSingulars,
  });

  return { records };
};
