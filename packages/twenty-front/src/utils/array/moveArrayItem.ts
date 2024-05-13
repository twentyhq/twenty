import { toSpliced } from '~/utils/array/toSpliced';

/**
 * Moves an item in an array from one index to another.
 *
 * @param array - The array to move an item in.
 * @param indices - The indices to move the item from and to.
 * @param indices.fromIndex - The index to move the item from.
 * @param indices.toIndex - The index to move the item to.
 *
 * @returns A new array with the item moved to the new index.
 *
 * @example
 * moveArrayItem(['a', 'b', 'c'], { fromIndex: 0, toIndex: 2 })
 * => ['b', 'c', 'a']
 */
export const moveArrayItem = <ArrayItem>(
  array: ArrayItem[],
  { fromIndex, toIndex }: { fromIndex: number; toIndex: number },
) => {
  if (!(fromIndex in array) || !(toIndex in array) || fromIndex === toIndex) {
    return array;
  }

  const itemToMove = array[fromIndex];
  const arrayWithoutItem = toSpliced(array, fromIndex, 1);
  const arrayWithMovedItem = toSpliced(
    arrayWithoutItem,
    toIndex,
    0,
    itemToMove,
  );

  return arrayWithMovedItem;
};
