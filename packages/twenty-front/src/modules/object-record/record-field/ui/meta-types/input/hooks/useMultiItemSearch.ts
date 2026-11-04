import { filterMultiItemsBySearch } from '@/object-record/record-field/ui/meta-types/input/utils/filterMultiItemsBySearch';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

const SEARCH_DEBOUNCE_MS = 150;
const MIN_ITEM_COUNT_FOR_SEARCH = 4;

export const useMultiItemSearch = <TItem>({
  items,
  getItemText,
}: {
  items: TItem[];
  getItemText: (item: TItem) => string;
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [debouncedSearchFilter] = useDebounce(searchFilter, SEARCH_DEBOUNCE_MS);

  const shouldShowSearch = items.length >= MIN_ITEM_COUNT_FOR_SEARCH;

  const filteredItemEntries = useMemo(
    () =>
      filterMultiItemsBySearch({
        items,
        searchFilter: shouldShowSearch ? debouncedSearchFilter : '',
        getItemText,
      }),
    [items, debouncedSearchFilter, shouldShowSearch, getItemText],
  );

  return {
    searchFilter,
    setSearchFilter,
    shouldShowSearch,
    filteredItemEntries,
  };
};
