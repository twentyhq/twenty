import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { computeBarChartCategoryTickValues } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartCategoryTickValues';
import { computeBarChartValueTickCount } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartValueTickCount';
import { getBarChartMargins } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartMargins';

const AVERAGE_CHARACTER_WIDTH_RATIO = 0.6;
const MIN_TICK_LABEL_LENGTH = 5;

export const getBarChartTickValues = ({
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
}) => {
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

  const widthPerTick =
    layout === 'vertical'
      ? categoryTickValues.length > 0
        ? availableWidth / categoryTickValues.length
        : 0
      : numberOfValueTicks > 0
        ? availableWidth / numberOfValueTicks
        : 0;

  const averageCharacterWidth = axisFontSize * AVERAGE_CHARACTER_WIDTH_RATIO;
  const maxBottomTickLabelLength = Math.max(
    MIN_TICK_LABEL_LENGTH,
    Math.floor(widthPerTick / averageCharacterWidth),
  );

  return {
    categoryTickValues,
    numberOfValueTicks,
    maxBottomTickLabelLength,
  };
};
