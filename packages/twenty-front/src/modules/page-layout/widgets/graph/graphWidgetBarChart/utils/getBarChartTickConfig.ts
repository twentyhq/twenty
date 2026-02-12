import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { computeBarChartCategoryTickValues } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartCategoryTickValues';
import { computeBarChartValueTickCount } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartValueTickCount';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { computeMaxLabelLengthForMargin } from '@/page-layout/widgets/graph/utils/computeMaxLabelLengthForMargin';
import { getTickRotationConfig } from '@/page-layout/widgets/graph/utils/getTickRotationConfig';
import { BarChartLayout } from '~/generated-metadata/graphql';

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
  axisFontSize,
  layout,
  margins,
}: {
  width: number;
  height: number;
  data: BarChartDatum[];
  indexBy: string;
  axisFontSize: number;
  layout: BarChartLayout;
  margins: ChartMargins;
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
    margins,
    layout,
  });

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

  const bottomTickCount =
    layout === BarChartLayout.VERTICAL
      ? categoryTickValues.length
      : numberOfValueTicks;
  const widthPerBottomTick =
    bottomTickCount > 0 && availableWidth > 0
      ? availableWidth / bottomTickCount
      : 0;

  const tickRotationConfig = getTickRotationConfig({
    widthPerTick: widthPerBottomTick,
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
