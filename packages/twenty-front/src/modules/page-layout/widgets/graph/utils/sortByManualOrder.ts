type ItemWithPosition = {
  position?: number | null;
};

type SortByManualOrderParams<T extends ItemWithPosition> = {
  items: T[];
  manualSortOrder: string[];
  getRawValue: (item: T) => string | null | undefined;
};

export const sortByManualOrder = <T extends ItemWithPosition>({
  items,
  manualSortOrder,
  getRawValue,
}: SortByManualOrderParams<T>): T[] => {
  const positionComparator = (a: T, b: T) =>
    (a.position ?? 0) - (b.position ?? 0);

  if (manualSortOrder.length === 0) {
    return items.toSorted(positionComparator);
  }

  const orderMap = new Map(
    manualSortOrder.map((value, index) => [value, index]),
  );

  return items.toSorted((a, b) => {
    const rawValueA = getRawValue(a) ?? '';
    const rawValueB = getRawValue(b) ?? '';
    const indexA = orderMap.get(rawValueA) ?? -1;
    const indexB = orderMap.get(rawValueB) ?? -1;

    if (indexA === -1 && indexB === -1) {
      return positionComparator(a, b);
    }
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });
};
