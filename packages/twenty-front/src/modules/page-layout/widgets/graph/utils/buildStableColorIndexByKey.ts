export const buildStableColorIndexByKey = (
  keys: string[],
): Map<string, number> => {
  const sortedKeys = [...keys].sort();

  return new Map(sortedKeys.map((key, index) => [key, index]));
};
