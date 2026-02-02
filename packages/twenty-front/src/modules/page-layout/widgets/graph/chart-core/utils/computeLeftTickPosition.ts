import { computeCategoryTickCenterPosition } from '@/page-layout/widgets/graph/chart-core/utils/computeCategoryTickCenterPosition';

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

  return computeCategoryTickCenterPosition({
    value,
    index,
    categoryValues,
    categoryIndexMap,
    categoryScale,
    reverse: true,
  });
};
