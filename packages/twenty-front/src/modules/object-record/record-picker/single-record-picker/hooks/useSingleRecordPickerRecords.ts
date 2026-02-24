import { useSingleRecordPickerPerformSearch } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerPerformSearch';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';

export const useSingleRecordPickerRecords = ({
  objectNameSingulars,
  excludedRecordIds = [],
}: {
  objectNameSingulars: string[];
  excludedRecordIds?: string[];
}) => {
  const recordPickerSearchFilter = useAtomComponentValue(
    singleRecordPickerSearchFilterComponentState,
  );

  const selectedRecordId = useAtomComponentValue(
    singleRecordPickerSelectedIdComponentState,
  );
  const { pickableMorphItems, loading } = useSingleRecordPickerPerformSearch({
    searchFilter: recordPickerSearchFilter,
    selectedIds: selectedRecordId ? [selectedRecordId] : [],
    excludedRecordIds: excludedRecordIds,
    objectNameSingulars,
  });

  return { pickableMorphItems, loading };
};
