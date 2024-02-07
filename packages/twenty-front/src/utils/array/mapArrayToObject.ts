export const mapArrayToObject = <ArrayItem>(
  array: ArrayItem[],
  computeKey: (item: ArrayItem) => string | number,
) => Object.fromEntries(array.map((item) => [computeKey(item), item]));
