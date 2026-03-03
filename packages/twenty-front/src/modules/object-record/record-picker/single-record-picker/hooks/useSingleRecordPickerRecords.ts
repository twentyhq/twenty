import { useSingleRecordPickerPerformSearch } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerPerformSearch';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type ObjectRecordFilterInput } from '~/generated/graphql';

export const useSingleRecordPickerRecords = ({
  objectNameSingulars,
  excludedRecordIds = [],
  additionalFilter,
}: {
  objectNameSingulars: string[];
  excludedRecordIds?: string[];
  additionalFilter?: ObjectRecordFilterInput;
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
    additionalFilter,
  });

  return { pickableMorphItems, loading };
};
