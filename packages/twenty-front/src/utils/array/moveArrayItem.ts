export const moveArrayItem = <Item>(
  array: Item[],
  { fromIndex, toIndex }: { fromIndex: number; toIndex: number },
) => {
  if (!(fromIndex in array) || !(toIndex in array) || fromIndex === toIndex) {
    return array;
  }

  const arrayWithMovedItem = [...array];
  const [itemToMove] = arrayWithMovedItem.splice(fromIndex, 1);
  arrayWithMovedItem.splice(toIndex, 0, itemToMove);

  return arrayWithMovedItem;
};
