export const getModelComparisonPercentile = (
  value: number,
  comparisonValues: number[],
): number => {
  if (comparisonValues.length < 2 || !comparisonValues.includes(value)) {
    return 0.5;
  }

  const lowerCount = comparisonValues.filter((entry) => entry < value).length;
  const equalCount = comparisonValues.filter((entry) => entry === value).length;

  return (lowerCount + (equalCount - 1) / 2) / (comparisonValues.length - 1);
};
