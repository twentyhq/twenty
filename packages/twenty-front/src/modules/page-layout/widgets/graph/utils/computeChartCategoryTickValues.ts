import { computeCategoryTickValues } from '@/page-layout/widgets/graph/utils/computeCategoryTickValues';

export const computeChartCategoryTickValues = ({
  availableSize,
  minimumSizePerTick,
  values,
}: {
  availableSize: number;
  minimumSizePerTick: number;
  values: (string | number)[];
}): (string | number)[] => {
  if (availableSize <= 0 || values.length === 0) {
    return [];
  }

  const numberOfTicks = Math.floor(availableSize / minimumSizePerTick);
  const tickIndices = computeCategoryTickValues(numberOfTicks, values.length);

  return tickIndices.map((index) => values[index]);
};
