// Later items win on a duplicate key, so computeItemKey should be unique per item
export const mapArrayToObject = <ArrayItem, Key extends string>(
  array: ArrayItem[],
  computeItemKey: (item: ArrayItem) => Key,
) =>
  Object.fromEntries(
    array.map((item) => [computeItemKey(item), item]),
  ) as Record<Key, ArrayItem>;
