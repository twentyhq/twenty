/**
 * Groups an array of items by a key computed from each item.
 *
 * @param array - The array to group.
 * @param computeGroupKey - A function that computes the group key to which the item belongs.
 *
 * @returns An object with items grouped by a computed key.
 *
 * @example
 * groupArrayItemsBy(
 *   [{ id: '1', type: 'fruit' }, { id: '2', type: 'vegetable' }, { id: '3', type: 'fruit' }],
 *   ({ type }) => type,
 * )
 * ⬇️
 * {
 *   fruit: [{ id: '1', type: 'fruit' }, { id: '3', type: 'fruit' }],
 *   vegetable: [{ id: '2', type: 'vegetable' }],
 * }
 */
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
