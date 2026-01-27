type CategoryScale = {
  offset: number;
  step: number;
  bandwidth: number;
};

type ComputeBottomTickPositionParams = {
  value: string | number;
  index: number;
  isVertical: boolean;
  categoryValues: (string | number)[];
  categoryIndexMap: Map<string, number>;
  categoryScale: CategoryScale;
  valueDomain: { min: number; max: number };
  innerWidth: number;
};

export const computeBottomTickPosition = ({
  value,
  index,
  isVertical,
  categoryValues,
  categoryIndexMap,
  categoryScale,
  valueDomain,
  innerWidth,
}: ComputeBottomTickPositionParams): number => {
  if (isVertical) {
    if (categoryValues.length === 0) {
      return 0;
    }
    const rawIndex =
      categoryIndexMap.get(String(value)) ??
      Math.min(index, categoryValues.length - 1);
    const categoryIndex = Math.min(
      Math.max(rawIndex, 0),
      categoryValues.length - 1,
    );
    const start = categoryScale.offset + categoryIndex * categoryScale.step;
    return start + categoryScale.bandwidth / 2;
  }
  const range = valueDomain.max - valueDomain.min;
  if (range === 0) {
    return 0;
  }
  return ((Number(value) - valueDomain.min) / range) * innerWidth;
};
