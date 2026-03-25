import { useSingleRecordPickerPerformSearch } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerPerformSearch';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useSingleRecordPickerRecords = ({
  objectNameSingulars,
  excludedRecordIds = [],
}: {
  objectNameSingulars: string[];
  excludedRecordIds?: string[];
}) => {
  const singleRecordPickerSearchFilter = useAtomComponentStateValue(
    singleRecordPickerSearchFilterComponentState,
  );

  const singleRecordPickerSelectedId = useAtomComponentStateValue(
    singleRecordPickerSelectedIdComponentState,
  );
  const { pickableMorphItems, loading } = useSingleRecordPickerPerformSearch({
    searchFilter: singleRecordPickerSearchFilter,
    selectedIds: singleRecordPickerSelectedId
      ? [singleRecordPickerSelectedId]
      : [],
    excludedRecordIds: excludedRecordIds,
    objectNameSingulars,
  });

  return { pickableMorphItems, loading };
};
