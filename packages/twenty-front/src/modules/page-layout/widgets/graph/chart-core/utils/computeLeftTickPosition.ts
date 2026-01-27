type CategoryScale = {
  offset: number;
  step: number;
  bandwidth: number;
};

type ComputeLeftTickPositionParams = {
  value: string | number;
  index: number;
  isVertical: boolean;
  categoryValues: (string | number)[];
  categoryIndexMap: Map<string, number>;
  categoryScale: CategoryScale;
  valueDomain: { min: number; max: number };
  innerHeight: number;
};

export const computeLeftTickPosition = ({
  value,
  index,
  isVertical,
  categoryValues,
  categoryIndexMap,
  categoryScale,
  valueDomain,
  innerHeight,
}: ComputeLeftTickPositionParams): number => {
  if (isVertical) {
    const range = valueDomain.max - valueDomain.min;
    if (range === 0) {
      return innerHeight;
    }
    return (
      innerHeight - ((Number(value) - valueDomain.min) / range) * innerHeight
    );
  }
  const categoryCount = categoryValues.length;
  if (categoryCount === 0) {
    return 0;
  }
  const rawIndex =
    categoryIndexMap.get(String(value)) ?? Math.min(index, categoryCount - 1);
  const clampedIndex = Math.min(Math.max(rawIndex, 0), categoryCount - 1);
  const effectiveIndex = categoryCount - 1 - clampedIndex;
  const start = categoryScale.offset + effectiveIndex * categoryScale.step;
  return start + categoryScale.bandwidth / 2;
};
