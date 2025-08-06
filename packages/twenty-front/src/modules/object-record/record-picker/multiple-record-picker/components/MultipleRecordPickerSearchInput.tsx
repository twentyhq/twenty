import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilCallback } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';

export const MultipleRecordPickerSearchInput = () => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );

  const [recordPickerSearchFilter, setRecordPickerSearchFilter] =
    useRecoilComponentState(multipleRecordPickerSearchFilterComponentState);

  const { performSearch } = useMultipleRecordPickerPerformSearch();

  const debouncedSearch = useDebouncedCallback(
    useRecoilCallback(
      ({ set }) =>
        (searchFilter: string) => {
          set(
            multipleRecordPickerSearchFilterComponentState.atomFamily({
              instanceId: componentInstanceId,
            }),
            searchFilter,
          );

          performSearch({
            multipleRecordPickerInstanceId: componentInstanceId,
            forceSearchFilter: searchFilter,
          });
        },
      [componentInstanceId, performSearch],
    ),
    500,
  );

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchFilter = event.currentTarget.value;
    setRecordPickerSearchFilter(newSearchFilter);
    debouncedSearch(newSearchFilter);
  };

  return (
    <DropdownMenuSearchInput
      value={recordPickerSearchFilter}
      onChange={handleFilterChange}
      autoFocus
    />
  );
};
