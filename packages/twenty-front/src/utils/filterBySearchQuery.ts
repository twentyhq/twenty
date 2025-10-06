import { isNonEmptyString } from '@sniptt/guards';

import { normalizeSearchText } from './normalizeSearchText';

type FilterBySearchQueryParams<T> = {
  items: T[];
  searchQuery: string;
  getSearchableValues: (item: T) => string[];
};

export const filterBySearchQuery = <T>({
  items,
  searchQuery,
  getSearchableValues,
}: FilterBySearchQueryParams<T>): T[] => {
  if (!isNonEmptyString(searchQuery)) {
    return items;
  }

  const normalizedQuery = normalizeSearchText(searchQuery);

  return items.filter((item) => {
    const searchableValues = getSearchableValues(item);
    return searchableValues.some((value) =>
      normalizeSearchText(value).includes(normalizedQuery),
    );
  });
};
