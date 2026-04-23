import { ROTATION_THRESHOLD_WIDTH } from '@/page-layout/widgets/graph/constants/RotationThresholdWidth';
import { computeCategoryTickValues } from '@/page-layout/widgets/graph/utils/computeCategoryTickValues';
import { isDefined } from 'twenty-shared/utils';

export const computeChartCategoryTickValues = ({
  availableSize,
  minimumSizePerTick,
  values,
  widthPerTick,
}: {
  availableSize: number;
  minimumSizePerTick: number;
  values: (string | number)[];
  widthPerTick?: number;
}): (string | number)[] => {
  if (availableSize <= 0 || values.length === 0) {
    return [];
  }

  if (isDefined(widthPerTick)) {
    const willRotate = widthPerTick < ROTATION_THRESHOLD_WIDTH;
    const shouldOmitTicks = willRotate && widthPerTick < minimumSizePerTick;

    if (!shouldOmitTicks) {
      return values;
    }
  }

  const numberOfTicks = Math.floor(availableSize / minimumSizePerTick);
  const tickIndices = computeCategoryTickValues(numberOfTicks, values.length);

  return tickIndices.map((index) => values[index]);
};
