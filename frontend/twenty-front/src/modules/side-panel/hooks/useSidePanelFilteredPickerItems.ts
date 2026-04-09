import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type UseSidePanelFilteredPickerItemsParams<T> = {
  items: T[];
  searchQuery: string;
  getSearchableValues: (item: T) => string[];
  appendSelectableIds?: string[];
};

type UseSidePanelFilteredPickerItemsResult<T> = {
  filteredItems: T[];
  selectableItemIds: string[];
  isEmpty: boolean;
  hasSearchQuery: boolean;
};

export const useSidePanelFilteredPickerItems = <T extends { id: string }>({
  items,
  searchQuery,
  getSearchableValues,
  appendSelectableIds = [],
}: UseSidePanelFilteredPickerItemsParams<T>): UseSidePanelFilteredPickerItemsResult<T> => {
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
