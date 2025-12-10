import { ROTATION_THRESHOLD_WIDTH } from '@/page-layout/widgets/graph/constants/RotationThresholdWidth';
import { computeCategoryTickValues } from '@/page-layout/widgets/graph/utils/computeCategoryTickValues';

export const computeChartCategoryTickValues = ({
  availableSize,
  minimumSizePerTick,
  values,
  widthPerDataPoint,
}: {
  availableSize: number;
  minimumSizePerTick: number;
  values: (string | number)[];
  widthPerDataPoint?: number;
}): (string | number)[] => {
  if (availableSize <= 0 || values.length === 0) {
    return [];
  }

  if (widthPerDataPoint !== undefined) {
    const willRotate = widthPerDataPoint < ROTATION_THRESHOLD_WIDTH;
    const shouldOmitTicks =
      willRotate && widthPerDataPoint < minimumSizePerTick;

    if (!shouldOmitTicks) {
      return values;
    }
  }

  const numberOfTicks = Math.floor(availableSize / minimumSizePerTick);
  const tickIndices = computeCategoryTickValues(numberOfTicks, values.length);

  return tickIndices.map((index) => values[index]);
};
