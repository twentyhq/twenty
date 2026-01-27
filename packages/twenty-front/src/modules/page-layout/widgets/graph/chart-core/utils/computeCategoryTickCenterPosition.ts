type CategoryScale = {
  offset: number;
  step: number;
  bandwidth: number;
};

type ComputeCategoryTickCenterPositionParams = {
  value: string | number;
  index: number;
  categoryValues: (string | number)[];
  categoryIndexMap: Map<string, number>;
  categoryScale: CategoryScale;
  reverse?: boolean;
};

export const computeCategoryTickCenterPosition = ({
  value,
  index,
  categoryValues,
  categoryIndexMap,
  categoryScale,
  reverse = false,
}: ComputeCategoryTickCenterPositionParams): number => {
  if (categoryValues.length === 0) {
    return 0;
  }

  const rawIndex =
    categoryIndexMap.get(String(value)) ??
    Math.min(index, categoryValues.length - 1);
  const clampedIndex = Math.min(
    Math.max(rawIndex, 0),
    categoryValues.length - 1,
  );
  const effectiveIndex = reverse
    ? categoryValues.length - 1 - clampedIndex
    : clampedIndex;
  const start = categoryScale.offset + effectiveIndex * categoryScale.step;

  return start + categoryScale.bandwidth / 2;
};
