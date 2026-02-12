import { computeCategoryTickCenterPosition } from '@/page-layout/widgets/graph/chart-core/utils/computeCategoryTickCenterPosition';

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
    return computeCategoryTickCenterPosition({
      value,
      index,
      categoryValues,
      categoryIndexMap,
      categoryScale,
    });
  }

  const range = valueDomain.max - valueDomain.min;
  if (range === 0) {
    return 0;
  }

  return ((Number(value) - valueDomain.min) / range) * innerWidth;
};
