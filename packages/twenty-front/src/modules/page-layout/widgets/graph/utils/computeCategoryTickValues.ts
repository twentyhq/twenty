export const computeCategoryTickValues = (
  numberOfTicks: number,
  totalValues: number,
): number[] => {
  if (numberOfTicks <= 0) return [];
  if (numberOfTicks === 1) return [0];
  if (numberOfTicks >= totalValues)
    return Array.from({ length: totalValues }, (_, i) => i);

  const step = (totalValues - 1) / (numberOfTicks - 1);

  return Array.from({ length: numberOfTicks }, (_, i) => {
    const index = Math.min(Math.round(i * step), totalValues - 1);
    return index;
  });
};
