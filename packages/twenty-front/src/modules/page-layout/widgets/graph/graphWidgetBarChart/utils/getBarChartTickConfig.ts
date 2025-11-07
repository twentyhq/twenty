import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { computeBarChartCategoryTickValues } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartCategoryTickValues';
import { computeBarChartValueTickCount } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartValueTickCount';
import { getBarChartMargins } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartMargins';

const AVERAGE_CHARACTER_WIDTH_RATIO = 0.6;
const MIN_TICK_LABEL_LENGTH = 5;
const MAX_LEFT_AXIS_LABEL_LENGTH = 10;

export type BarChartTickConfig = {
  categoryTickValues: (string | number)[];
  numberOfValueTicks: number;
  maxBottomAxisTickLabelLength: number;
  maxLeftAxisTickLabelLength: number;
};

const calculateWidthPerTick = ({
  layout,
  availableWidth,
  categoryTickCount,
  valueTickCount,
}: {
  layout: 'vertical' | 'horizontal';
  availableWidth: number;
  categoryTickCount: number;
  valueTickCount: number;
}): number => {
  if (layout === 'vertical') {
    return categoryTickCount > 0 ? availableWidth / categoryTickCount : 0;
  }

  return valueTickCount > 0 ? availableWidth / valueTickCount : 0;
};

const calculateMaxTickLabelLength = ({
  widthPerTick,
  axisFontSize,
}: {
  widthPerTick: number;
  axisFontSize: number;
}): number => {
  const averageCharacterWidth = axisFontSize * AVERAGE_CHARACTER_WIDTH_RATIO;
  const calculatedLength = Math.floor(widthPerTick / averageCharacterWidth);

  return Math.max(MIN_TICK_LABEL_LENGTH, calculatedLength);
};

export const getBarChartTickConfig = ({
  width,
  height,
  data,
  indexBy,
  xAxisLabel,
  yAxisLabel,
  axisFontSize,
  layout,
}: {
  width: number;
  height: number;
  data: BarChartDataItem[];
  indexBy: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  axisFontSize: number;
  layout: 'vertical' | 'horizontal';
}): BarChartTickConfig => {
  const categoryTickValues = computeBarChartCategoryTickValues({
    axisSize: layout === 'vertical' ? width : height,
    axisFontSize,
    data,
    indexBy,
    xAxisLabel,
    yAxisLabel,
    layout,
  });

  const margins = getBarChartMargins({ xAxisLabel, yAxisLabel, layout });

  const availableWidth = width - (margins.left + margins.right);
  const availableHeight = height - (margins.top + margins.bottom);

  const numberOfValueTicks = computeBarChartValueTickCount({
    axisSize: layout === 'vertical' ? availableHeight : availableWidth,
    axisFontSize,
    layout,
  });

  const widthPerTick = calculateWidthPerTick({
    layout,
    availableWidth,
    categoryTickCount: categoryTickValues.length,
    valueTickCount: numberOfValueTicks,
  });

  const maxBottomAxisTickLabelLength = calculateMaxTickLabelLength({
    widthPerTick,
    axisFontSize,
  });

  // TODO: Make this dynamic based on the data
  const maxLeftAxisTickLabelLength = MAX_LEFT_AXIS_LABEL_LENGTH;

  return {
    categoryTickValues,
    numberOfValueTicks,
    maxBottomAxisTickLabelLength,
    maxLeftAxisTickLabelLength,
  };
};
