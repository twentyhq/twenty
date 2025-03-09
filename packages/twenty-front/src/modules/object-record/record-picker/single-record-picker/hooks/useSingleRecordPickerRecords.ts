import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { useFilteredSearchRecordQuery } from '@/search/hooks/useFilteredSearchRecordQuery';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useSingleRecordPickerRecords = ({
  objectNameSingular,
  excludedRecordIds = [],
}: {
  objectNameSingular: string;
  excludedRecordIds?: string[];
}) => {
  const recordPickerSearchFilter = useRecoilComponentValueV2(
    singleRecordPickerSearchFilterComponentState,
  );

  const selectedRecordId = useRecoilComponentValueV2(
    singleRecordPickerSelectedIdComponentState,
  );

  const records = useFilteredSearchRecordQuery({
    searchFilter: recordPickerSearchFilter,
    selectedIds: selectedRecordId ? [selectedRecordId] : [],
    excludedRecordIds: excludedRecordIds,
    objectNameSingular,
  });

  return { records };
};
