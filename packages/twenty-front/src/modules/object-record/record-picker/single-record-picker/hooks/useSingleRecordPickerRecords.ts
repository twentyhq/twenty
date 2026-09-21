import { useSingleRecordPickerPerformSearch } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerPerformSearch';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type ObjectRecordFilterInput } from '~/generated/graphql';

export const useSingleRecordPickerRecords = ({
  objectNameSingulars,
  excludedRecordIds = [],
  filter,
}: {
  objectNameSingulars: string[];
  excludedRecordIds?: string[];
  filter?: ObjectRecordFilterInput;
}) => {
  const singleRecordPickerSearchFilter = useAtomComponentStateValue(
    singleRecordPickerSearchFilterComponentState,
  );

  const singleRecordPickerSelectedId = useAtomComponentStateValue(
    singleRecordPickerSelectedIdComponentState,
  );
  return useSingleRecordPickerPerformSearch({
    searchFilter: singleRecordPickerSearchFilter,
    selectedIds: singleRecordPickerSelectedId
      ? [singleRecordPickerSelectedId]
      : [],
    excludedRecordIds: excludedRecordIds,
    objectNameSingulars,
    filter,
  });
};
