import { isNonEmptyString } from '@sniptt/guards';
import { normalizeSearchText } from 'twenty-ui/utilities';

export type MultiItemEntry<TItem> = { item: TItem; index: number };

export const filterMultiItemsBySearch = <TItem>({
  items,
  searchFilter,
  getItemText,
}: {
  items: TItem[];
  searchFilter: string;
  getItemText: (item: TItem) => string;
}): MultiItemEntry<TItem>[] => {
  const itemEntries = items.map((item, index) => ({ item, index }));

  if (!isNonEmptyString(searchFilter)) {
    return itemEntries;
  }

  const searchTerm = normalizeSearchText(searchFilter);

  return itemEntries.filter(({ item }) =>
    normalizeSearchText(getItemText(item)).includes(searchTerm),
  );
};
