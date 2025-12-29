import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { calculateWidthPerTick } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateWidthPerTick';
import { computeBarChartCategoryTickValues } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartCategoryTickValues';
import { computeBarChartValueTickCount } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartValueTickCount';
import { getBarChartMargins } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartMargins';
import { computeMaxLabelLengthForMargin } from '@/page-layout/widgets/graph/utils/computeMaxLabelLengthForMargin';
import { getTickRotationConfig } from '@/page-layout/widgets/graph/utils/getTickRotationConfig';
import { type BarDatum } from '@nivo/bar';
import { BarChartLayout } from '~/generated/graphql';

export type BarChartTickConfig = {
  categoryTickValues: (string | number)[];
  numberOfValueTicks: number;
  maxBottomAxisTickLabelLength: number;
  maxLeftAxisTickLabelLength: number;
  bottomAxisTickRotation: number;
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
  data: BarDatum[];
  indexBy: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  axisFontSize: number;
  layout: BarChartLayout;
}): BarChartTickConfig => {
  const clampValueTickCount = (tickCount: number) =>
    Math.min(
      BAR_CHART_CONSTANTS.MAXIMUM_VALUE_TICK_COUNT,
      Math.max(BAR_CHART_CONSTANTS.MINIMUM_VALUE_TICK_COUNT, tickCount),
    );

  const categoryTickValues = computeBarChartCategoryTickValues({
    axisSize: layout === BarChartLayout.VERTICAL ? width : height,
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

  const numberOfValueTicks = clampValueTickCount(
    computeBarChartValueTickCount({
      axisSize:
        layout === BarChartLayout.VERTICAL ? availableHeight : availableWidth,
      axisFontSize,
      layout,
    }),
  );

  const widthPerTick = calculateWidthPerTick({
    layout,
    availableWidth,
    categoryTickCount: categoryTickValues.length,
    valueTickCount: numberOfValueTicks,
  });

  const actualDataPointCount = data.length;
  const widthPerDataPoint =
    layout === BarChartLayout.VERTICAL &&
    actualDataPointCount > 0 &&
    availableWidth > 0
      ? availableWidth / actualDataPointCount
      : widthPerTick;

  const tickRotationConfig = getTickRotationConfig({
    widthPerTick: widthPerDataPoint,
    axisFontSize,
  });

  const maxLeftAxisTickLabelLength = computeMaxLabelLengthForMargin({
    marginSize: margins.left,
    axisFontSize,
  });

  return {
    categoryTickValues,
    numberOfValueTicks,
    maxBottomAxisTickLabelLength: tickRotationConfig.maxLabelLength,
    maxLeftAxisTickLabelLength,
    bottomAxisTickRotation: tickRotationConfig.tickRotation,
  };
};
