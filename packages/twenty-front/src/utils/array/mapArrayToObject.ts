/**
 * Transforms an array of items into an object where the keys are computed from each item.
 *
 * @param array - The array to transform.
 * @param computeItemKey - A function that computes a key from an item.
 *
 * @returns An object where the keys are computed from the items in the array.
 *
 * @example
 * mapArrayToObject(
 *   [{ id: '1', type: 'fruit' }, { id: '2', type: 'vegetable' }, { id: '3', type: 'fruit' }],
 *   ({ id }) => id,
 * )
 * ⬇️
 * {
 *  '1': { id: '1', type: 'fruit' },
 *  '2': { id: '2', type: 'vegetable' },
 *  '3': { id: '3', type: 'fruit' },
 * }
 */
export const mapArrayToObject = <ArrayItem, Key extends string>(
  array: ArrayItem[],
  computeItemKey: (item: ArrayItem) => Key,
) =>
  Object.fromEntries(
    array.map((item) => [computeItemKey(item), item]),
  ) as Record<Key, ArrayItem>;
