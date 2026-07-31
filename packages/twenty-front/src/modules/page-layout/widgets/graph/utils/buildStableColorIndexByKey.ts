// Palette fallback colors are picked by index. Deriving that index from the
// alphabetical rank of the series key instead of the display position keeps
// colors stable when display order changes with the data (e.g. value orderBy).
export const buildStableColorIndexByKey = (
  keys: string[],
): Map<string, number> => {
  const sortedKeys = [...keys].sort();

  return new Map(sortedKeys.map((key, index) => [key, index]));
};
