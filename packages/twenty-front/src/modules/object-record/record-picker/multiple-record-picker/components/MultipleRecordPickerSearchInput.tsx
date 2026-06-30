import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useDebouncedCallback } from 'use-debounce';

export const MultipleRecordPickerSearchInput = () => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );

  const [
    multipleRecordPickerSearchFilter,
    setMultipleRecordPickerSearchFilter,
  ] = useAtomComponentState(multipleRecordPickerSearchFilterComponentState);

  const { performSearch } = useMultipleRecordPickerPerformSearch();

  const store = useStore();

  const debouncedSearch = useDebouncedCallback(
    useCallback(
      (searchFilter: string) => {
        store.set(
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
      [componentInstanceId, performSearch, store],
    ),
    500,
  );

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchFilter = event.currentTarget.value;
    setMultipleRecordPickerSearchFilter(newSearchFilter);
    debouncedSearch(newSearchFilter);
  };

  return (
    <DropdownMenuSearchInput
      value={multipleRecordPickerSearchFilter}
      onChange={handleFilterChange}
      autoFocus
    />
  );
};
