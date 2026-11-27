import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarChartDatum';
import { computeMinHeightPerTick } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/computeMinHeightPerTick';
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

  const horizontalLabelSpacing =
    COMMON_CHART_CONSTANTS.TICK_MINIMUM_NUMBER_OF_DISPLAYED_CHARACTERS *
      COMMON_CHART_CONSTANTS.HORIZONTAL_LABEL_CHARACTER_WIDTH_RATIO *
      axisFontSize +
    COMMON_CHART_CONSTANTS.MINIMUM_GAP_BETWEEN_DATA_LABELS;

  return computeChartCategoryTickValues({
    availableSize: availableAxisSize,
    minimumSizePerTick: horizontalLabelSpacing,
    values,
  });
};
