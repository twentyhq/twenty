import { type ChangeEvent } from 'react';

import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { Dropdown, useDropdownPage } from 'twenty-ui/components/navigation';
import { t } from '@lingui/core/macro';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useDebouncedCallback } from 'use-debounce';

const SEARCH_DEBOUNCE_DELAY_IN_MILLISECONDS = 500;

export const MultipleRecordPickerSearchInput = () => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );
  const { isActive } = useDropdownPage();

  const [
    multipleRecordPickerSearchFilter,
    setMultipleRecordPickerSearchFilter,
  ] = useAtomComponentState(multipleRecordPickerSearchFilterComponentState);

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

  return (
    <Dropdown.Search
      aria-label={t`Search records`}
      placeholder={t`Search`}
      value={multipleRecordPickerSearchFilter}
      onChange={handleFilterChange}
    />
  );
};
