export const buildAlphabeticalRankByKey = (
  keys: string[],
): Map<string, number> => {
  const uniqueSortedKeys = [...new Set(keys)].sort();

  return new Map(uniqueSortedKeys.map((key, rank) => [key, rank]));
};
