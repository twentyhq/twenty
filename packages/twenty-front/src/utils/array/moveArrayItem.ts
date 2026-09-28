// moveArrayItem(['a', 'b', 'c'], { fromIndex: 0, toIndex: 2 }) => ['b', 'c', 'a']
export const moveArrayItem = <ArrayItem>(
  array: ArrayItem[],
  { fromIndex, toIndex }: { fromIndex: number; toIndex: number },
) => {
  if (!(fromIndex in array) || !(toIndex in array) || fromIndex === toIndex) {
    return array;
  }

  const reorderedArray = [...array];
  const movedItems = reorderedArray.splice(fromIndex, 1);
  reorderedArray.splice(toIndex, 0, ...movedItems);

  return reorderedArray;
};
