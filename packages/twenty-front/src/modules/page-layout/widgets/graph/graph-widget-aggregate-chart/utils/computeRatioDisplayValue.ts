export const computeRatioDisplayValue = ({
  numeratorCount,
  denominatorCount,
}: {
  numeratorCount: number;
  denominatorCount: number;
}): string => {
  if (denominatorCount === 0) {
    return '0%';
  }

  const ratio = (numeratorCount / denominatorCount) * 100;
  const formattedRatio = ratio.toFixed(1);

  if (formattedRatio.endsWith('.0')) {
    return `${Math.round(ratio)}%`;
  }

  return `${formattedRatio}%`;
};
