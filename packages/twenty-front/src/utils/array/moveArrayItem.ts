import { toSpliced } from '~/utils/array/toSpliced';

// moveArrayItem(['a', 'b', 'c'], { fromIndex: 0, toIndex: 2 }) => ['b', 'c', 'a']
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
