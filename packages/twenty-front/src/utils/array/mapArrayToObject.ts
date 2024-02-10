export const mapArrayToObject = <ArrayItem>(
  array: ArrayItem[],
  computeItemKey: (item: ArrayItem) => string,
) => Object.fromEntries(array.map((item) => [computeItemKey(item), item]));
