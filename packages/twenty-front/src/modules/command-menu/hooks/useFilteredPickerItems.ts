import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type UseFilteredPickerItemsParams<T> = {
  items: T[];
  searchQuery: string;
  getSearchableValues: (item: T) => string[];
  appendSelectableIds?: string[];
};

type UseFilteredPickerItemsResult<T> = {
  filteredItems: T[];
  selectableItemIds: string[];
  isEmpty: boolean;
  hasSearchQuery: boolean;
};

export const useFilteredPickerItems = <T extends { id: string }>({
  items,
  searchQuery,
  getSearchableValues,
  appendSelectableIds = [],
}: UseFilteredPickerItemsParams<T>): UseFilteredPickerItemsResult<T> => {
  const filteredItems = filterBySearchQuery({
    items,
    searchQuery,
    getSearchableValues,
  });

  const selectableItemIds =
    filteredItems.length > 0
      ? [...filteredItems.map((item) => item.id), ...appendSelectableIds]
      : appendSelectableIds;

  const isEmpty = filteredItems.length === 0;
  const hasSearchQuery = searchQuery.trim().length > 0;

  return {
    filteredItems,
    selectableItemIds,
    isEmpty,
    hasSearchQuery,
  };
};
