import { isDefined } from 'twenty-shared/utils';

export const getNavigationSectionVisibleItems = <TItem>({
  items,
  visibleItemLimit,
  hasMoreItemsToLoad = false,
}: {
  items: TItem[];
  visibleItemLimit?: number | null;
  hasMoreItemsToLoad?: boolean;
}): {
  visibleItems: TItem[];
  hiddenItems: TItem[];
  hasHiddenItems: boolean;
} => {
  if (!isDefined(visibleItemLimit)) {
    return { visibleItems: items, hiddenItems: [], hasHiddenItems: false };
  }

  const hiddenItems = items.slice(visibleItemLimit);

  return {
    visibleItems: items.slice(0, visibleItemLimit),
    hiddenItems,
    hasHiddenItems: hiddenItems.length > 0 || hasMoreItemsToLoad,
  };
};
