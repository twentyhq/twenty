export const withModelRanking = ({
  description,
  value,
  comparisonValues,
  lowerIsBetter = false,
}: {
  description: string;
  value: number;
  comparisonValues: number[];
  lowerIsBetter?: boolean;
}): string => {
  if (comparisonValues.length < 2) {
    return description;
  }

  const rank =
    comparisonValues.filter((comparisonValue) =>
      lowerIsBetter ? comparisonValue < value : comparisonValue > value,
    ).length + 1;
  const total = comparisonValues.length;
  const ranking = `#${rank}/${total}`;

  return `${ranking} · ${description}`;
};
