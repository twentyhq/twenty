import { isDefined } from 'twenty-shared/utils';

type SortByManualOrderParams<T> = {
  items: T[];
  manualSortOrder: string[];
  getRawValue: (item: T) => string | null | undefined;
};

export const sortByManualOrder = <T>({
  items,
  manualSortOrder,
  getRawValue,
}: SortByManualOrderParams<T>): T[] => {
  if (manualSortOrder.length === 0) {
    return items;
  }

  const orderMap = new Map(
    manualSortOrder.map((value, index) => [value, index]),
  );

  return items.toSorted((a, b) => {
    const rawValueA = getRawValue(a) ?? '';
    const rawValueB = getRawValue(b) ?? '';

    const indexA = orderMap.get(rawValueA);
    const indexB = orderMap.get(rawValueB);

    if (!isDefined(indexA) && !isDefined(indexB)) {
      return 0;
    }

    if (!isDefined(indexA)) {
      return 1;
    }

    if (!isDefined(indexB)) {
      return -1;
    }

    return indexA - indexB;
  });
};
