export const groupArrayItemsBy = <Item, Key extends string>(
  array: Item[],
  computeGroupKey: (item: Item) => Key,
) =>
  array.reduce<Partial<Record<Key, Item[]>>>((result, item) => {
    const groupKey = computeGroupKey(item);
    const previousGroup = result[groupKey] || [];

    return {
      ...result,
      [groupKey]: [...previousGroup, item],
    };
  }, {});
