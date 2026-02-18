import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { computeMinHeightPerTick } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeMinHeightPerTick';
import { computeChartCategoryTickValues } from '@/page-layout/widgets/graph/utils/computeChartCategoryTickValues';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { BarChartLayout } from '~/generated-metadata/graphql';

export const computeBarChartCategoryTickValues = ({
  axisSize,
  axisFontSize,
  data,
  indexBy,
  margins,
  layout,
}: {
  axisSize: number;
  axisFontSize: number;
  data: BarChartDatum[];
  indexBy: string;
  layout: BarChartLayout;
  margins: ChartMargins;
}): (string | number)[] => {
  if (axisSize === 0 || data.length === 0) {
    return [];
  }

  const values = data.map((item) => item[indexBy] as string | number);

  const totalMargins =
    layout === BarChartLayout.VERTICAL
      ? margins.left + margins.right
      : margins.top + margins.bottom;

  const availableAxisSize = axisSize - totalMargins;

  if (layout === BarChartLayout.HORIZONTAL) {
    return computeChartCategoryTickValues({
      availableSize: availableAxisSize,
      minimumSizePerTick: computeMinHeightPerTick({ axisFontSize }),
      values,
    });
  }

  const widthPerTick = data.length > 0 ? availableAxisSize / data.length : 0;

  return computeChartCategoryTickValues({
    availableSize: availableAxisSize,
    minimumSizePerTick: BAR_CHART_CONSTANTS.MINIMUM_WIDTH_PER_TICK_ROTATED,
    values,
    widthPerTick,
  });
};
