type ValueScale = {
  valueToPixel: (value: number) => number;
  range: number;
};

export const computeValueScale = ({
  domain,
  axisLength,
}: {
  domain: { min: number; max: number };
  axisLength: number;
}): ValueScale => {
  const range = domain.max - domain.min;

  const valueToPixel = (value: number): number => {
    if (range === 0) {
      return 0;
    }
    const raw = ((value - domain.min) / range) * axisLength;
    return Math.min(axisLength, Math.max(0, raw));
  };

  return { valueToPixel, range };
};
