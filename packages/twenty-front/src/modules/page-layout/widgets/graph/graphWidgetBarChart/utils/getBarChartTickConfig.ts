import { BAR_CHART_MAXIMUM_VALUE_TICK_COUNT } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMaximumValueTickCount';
import { BAR_CHART_MINIMUM_VALUE_TICK_COUNT } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMinimumValueTickCount';
import { BarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLayout';
import { calculateMaxTickLabelLength } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateMaxTickLabelLength';
import { calculateWidthPerTick } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateWidthPerTick';
import { computeBarChartCategoryTickValues } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartCategoryTickValues';
import { computeBarChartValueTickCount } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartValueTickCount';
import { getBarChartMargins } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartMargins';
import { getTickRotationConfig } from '@/page-layout/widgets/graph/utils/getTickRotationConfig';
import { NO_ROTATION_ANGLE } from '@/page-layout/widgets/graph/utils/noRotationAngle';
import { type BarDatum } from '@nivo/bar';

const MAX_LEFT_AXIS_LABEL_LENGTH = 10;

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
      BAR_CHART_MAXIMUM_VALUE_TICK_COUNT,
      Math.max(BAR_CHART_MINIMUM_VALUE_TICK_COUNT, tickCount),
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

  const tickRotationConfig =
    layout === BarChartLayout.VERTICAL
      ? getTickRotationConfig({ widthPerTick: widthPerDataPoint, axisFontSize })
      : {
          tickRotation: NO_ROTATION_ANGLE,
          maxLabelLength: MAX_LEFT_AXIS_LABEL_LENGTH,
        };

  const maxBottomAxisTickLabelLength =
    layout === BarChartLayout.VERTICAL
      ? tickRotationConfig.maxLabelLength
      : calculateMaxTickLabelLength({
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
    bottomAxisTickRotation: tickRotationConfig.tickRotation,
  };
};
