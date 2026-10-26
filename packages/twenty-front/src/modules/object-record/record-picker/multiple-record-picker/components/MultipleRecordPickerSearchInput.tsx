import { type ChangeEvent, type KeyboardEvent } from 'react';
import { useStore } from 'jotai';
import { Key } from 'ts-key-enum';

import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerIsLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsLoadingComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { Dropdown, useDropdownPage } from 'twenty-ui/components/navigation';
import { t } from '@lingui/core/macro';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useDebouncedCallback } from 'use-debounce';

const SEARCH_DEBOUNCE_DELAY_IN_MILLISECONDS = 500;

export const MultipleRecordPickerSearchInput = () => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );
  const { isActive } = useDropdownPage();
  const store = useStore();

  const [
    multipleRecordPickerSearchFilter,
    setMultipleRecordPickerSearchFilter,
  ] = useAtomComponentState(multipleRecordPickerSearchFilterComponentState);

  const multipleRecordPickerIsLoadingState = useAtomComponentStateCallbackState(
    multipleRecordPickerIsLoadingComponentState,
    componentInstanceId,
  );

  const { performSearch } = useMultipleRecordPickerPerformSearch();

  const debouncedSearch = useDebouncedCallback((searchFilter: string) => {
    if (!isActive) {
      return;
    }

    void performSearch({
      multipleRecordPickerInstanceId: componentInstanceId,
      forceSearchFilter: searchFilter,
    });
  }, SEARCH_DEBOUNCE_DELAY_IN_MILLISECONDS);

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newSearchFilter = event.currentTarget.value;
    setMultipleRecordPickerSearchFilter(newSearchFilter);
    debouncedSearch(newSearchFilter);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== Key.Enter || event.nativeEvent.isComposing) {
      return;
    }

    const areResultsStale =
      debouncedSearch.isPending() ||
      store.get(multipleRecordPickerIsLoadingState);

    if (!areResultsStale) {
      return;
    }

    event.preventDefault();
    debouncedSearch.flush();
  };

  return (
    <Dropdown.Search
      aria-label={t`Search records`}
      placeholder={t`Search`}
      value={multipleRecordPickerSearchFilter}
      onChange={handleFilterChange}
      onKeyDown={handleKeyDown}
    />
  );
};
