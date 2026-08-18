// Groups are keyed by computeGroupKey, so a key no item produces is absent rather than empty
export const groupArrayItemsBy = <ArrayItem, Key extends string | number>(
  array: ArrayItem[],
  computeGroupKey: (item: ArrayItem) => Key,
) =>
  array.reduce<Partial<Record<Key, ArrayItem[]>>>((result, item) => {
    const groupKey = computeGroupKey(item);
    const previousGroup = result[groupKey] || [];

    return {
      ...result,
      [groupKey]: [...previousGroup, item],
    };
  }, {});
