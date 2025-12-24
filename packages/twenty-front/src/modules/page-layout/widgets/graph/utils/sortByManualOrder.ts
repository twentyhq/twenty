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
  if (!manualSortOrder.length) {
    return items;
  }

  const orderMap = new Map(
    manualSortOrder.map((value, index) => [value, index]),
  );

  return items.toSorted((a, b) => {
    const rawValueA = getRawValue(a) ?? '';
    const rawValueB = getRawValue(b) ?? '';
    const indexA = orderMap.get(rawValueA) ?? -1;
    const indexB = orderMap.get(rawValueB) ?? -1;

    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });
};
